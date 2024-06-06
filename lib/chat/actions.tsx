import 'server-only'

import { openai } from '@ai-sdk/openai'
import {
  createAI,
  createStreamableUI,
  createStreamableValue,
  getAIState,
  getMutableAIState,
  streamUI
} from 'ai/rsc'

import {
  BotCard,
  BotMessage,
  SystemMessage,
  spinner
} from '@/components/stocks'

import { saveChat } from '@/app/actions'
import { auth } from '@/auth'
import AccountsBalance from '@/components/balance/accounts-balance'
import BillConfirm from '@/components/balance/bill-confirm'
import SendConfirm from '@/components/balance/send-confirm'
import TransactionHistory from '@/components/balance/transaction-history'
import { EventsSkeleton } from '@/components/stocks/events-skeleton'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import { StockSkeleton } from '@/components/stocks/stock-skeleton'
import { StocksSkeleton } from '@/components/stocks/stocks-skeleton'
import { Chat, Message } from '@/lib/types'
import {
  formatNumber,
  nanoid,
  runAsyncFnWithoutBlocking,
  sleep
} from '@/lib/utils'
import { z } from 'zod'

async function confirmPurchase(symbol: string, price: number, amount: number) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  const purchasing = createStreamableUI(
    <div className="inline-flex items-start gap-1 md:items-center">
      {spinner}
      <p className="mb-2">
        Purchasing {amount} ${symbol}...
      </p>
    </div>
  )

  const systemMessage = createStreamableUI(null)

  runAsyncFnWithoutBlocking(async () => {
    await sleep(1000)

    purchasing.update(
      <div className="inline-flex items-start gap-1 md:items-center">
        {spinner}
        <p className="mb-2">
          Purchasing {amount} ${symbol}... working on it...
        </p>
      </div>
    )

    await sleep(1000)

    purchasing.done(
      <div>
        <p className="mb-2">
          You have successfully purchased {amount} ${symbol}. Total cost:{' '}
          {formatNumber(amount * price)}
        </p>
      </div>
    )

    systemMessage.done(
      <SystemMessage>
        You have purchased {amount} shares of {symbol} at ${price}. Total cost ={' '}
        {formatNumber(amount * price)}.
      </SystemMessage>
    )

    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: nanoid(),
          role: 'system',
          content: `[User has purchased ${amount} shares of ${symbol} at ${price}. Total cost = ${
            amount * price
          }]`
        }
      ]
    })
  })

  return {
    purchasingUI: purchasing.value,
    newMessage: {
      id: nanoid(),
      display: systemMessage.value
    }
  }
}

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  const result = await streamUI({
    model: openai('gpt-3.5-turbo'),
    initial: <SpinnerMessage />,
    system: `\
    You are a conversation bot that can help users manage their finances, step by step.
    You and the user can discuss the user's financial condition and the user can perform financial transactions using the User Interface.

    Messages inside [] means that it's a UI element or a user event. For example:
    - "[User sent Rp. 10.000 to Alice]" means that user has confirmed the transfer request of Rp. 10.000 to Alice.
    - "[User paid Rp. 100.000 of PLN]" means that user has confirmed the pay bill request of Rp. 100.000 to PLN.
    
    If the user requests sending money, you should ask for their confirmation. call \`send_money\` to show the confirmation UI.
    If the user requests paying a bill, call \`pay_bill\` to show the pay bill UI.
    If you want to show the user's account balance, call \`get_balance\`.
    If you want to show the user's transaction history, call \`get_transaction_history\`.
    If the user wants to create a loan or complete another impossible task, respond that you are a demo and cannot do that.

    Here are some assumptions that must be followed:
    - Possible accounts name are and only are: "BRI", "BCA", "Mandiri" concatenated with their purpose, such as "Savings", "Payroll", "Investments".
    - Possible billers are an only are: "PLN", "Telkom", "Indihome", "Credit Card".

    Every amount of money has to be represented in Indonesian Rupiah Currency (Rp.), use . (dot) as thousand separator.
    Besides that, you can also chat with users and do some calculations if needed.`,
    messages: [
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name
      }))
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('')
        textNode = <BotMessage content={textStream.value} />
      }

      if (done) {
        textStream.done()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content
            }
          ]
        })
      } else {
        textStream.update(delta)
      }

      return textNode
    },
    tools: {
      getBalance: {
        description: `Show imaginary user's 2 accounts and their balances.`,
        parameters: z.object({
          accountsBalance: z.array(
            z.object({
              account: z.object({
                name: z.string().describe('The account name'),
                number: z.string().describe('The account number')
              }),
              balance: z
                .string()
                .describe('The balance of the account, formatted as a currency')
            })
          )
        }),
        generate: async function* ({ accountsBalance }) {
          yield (
            <BotCard>
              <StocksSkeleton />
            </BotCard>
          )

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'getBalance',
                    toolCallId,
                    args: { accountsBalance }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'getBalance',
                    toolCallId,
                    result: accountsBalance
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <AccountsBalance props={accountsBalance} />
            </BotCard>
          )
        }
      },
      sendMoney: {
        description: `Use this to ask for user's confirmation when sending/transfering money.`,
        parameters: z.object({
          sourceAccount: z.object({
            name: z.string().describe('The source account name'),
            number: z.string().describe('The source account number'),
            holder: z.string().describe('The source account holder')
          }),
          destinationAccount: z.object({
            name: z.string().describe('The destination account name'),
            number: z.string().describe('The destination account number'),
            holder: z.string().describe('The destination account holder')
          }),
          amount: z
            .string()
            .describe('The amount of money to send, formatted as a currency'),
          remarks: z
            .string()
            .optional()
            .describe('The remarks of the transaction')
        }),
        generate: async function* ({
          sourceAccount,
          destinationAccount,
          amount,
          remarks
        }) {
          yield (
            <BotCard>
              <StockSkeleton />
            </BotCard>
          )

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'sendMoney',
                    toolCallId,
                    args: { sourceAccount, destinationAccount, amount, remarks }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'sendMoney',
                    toolCallId,
                    result: {
                      sourceAccount,
                      destinationAccount,
                      amount,
                      remarks
                    }
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <SendConfirm
                props={{ sourceAccount, destinationAccount, amount, remarks }}
              />
            </BotCard>
          )
        }
      },
      payBill: {
        description: `Use this to ask for user's confirmation when paying bills.`,
        parameters: z.object({
          billing: z.object({
            name: z.string().describe('The biller name'),
            number: z.string().describe('The billing number')
          }),
          account: z.object({
            name: z.string().describe('The account name'),
            number: z.string().describe('The account number'),
            holder: z.string().describe('The account holder')
          }),
          amount: z
            .string()
            .describe('The amount of money to pay, formatted as a currency')
        }),
        generate: async function* ({ billing, account, amount }) {
          yield (
            <BotCard>
              <StockSkeleton />
            </BotCard>
          )

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'payBill',
                    toolCallId,
                    args: { billing, account, amount }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'payBill',
                    toolCallId,
                    result: { billing, account, amount }
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <BillConfirm props={{ billing, account, amount }} />
            </BotCard>
          )
        }
      },
      getTransactionHistory: {
        description:
          'List 5 items of imaginary funny imaginary transaction history, in and out.',
        parameters: z.object({
          events: z.array(
            z.object({
              date: z
                .string()
                .describe('The date of the event, in ISO-8601 format'),
              actor: z
                .string()
                .describe('The actor of the event, recipient or sender'),
              amount: z
                .string()
                .describe('The amount of transaction, formatted as a currency'),
              type: z
                .enum(['in', 'out'])
                .describe('The type of the transaction')
            })
          )
        }),
        generate: async function* ({ events }) {
          yield (
            <BotCard>
              <EventsSkeleton />
            </BotCard>
          )

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'getTransactionHistory',
                    toolCallId,
                    args: { events }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'getTransactionHistory',
                    toolCallId,
                    result: { events }
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <TransactionHistory props={events} />
            </BotCard>
          )
        }
      }
    }
  })

  return {
    id: nanoid(),
    display: result.value
  }
}

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
    confirmPurchase
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState()

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  onSetAIState: async ({ state }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`

      const firstMessageContent = messages[0].content as string
      const title = firstMessageContent.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path
      }

      await saveChat(chat)
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'tool' ? (
          message.content.map(tool => {
            return tool.toolName === 'getBalance' ? (
              <BotCard>
                {/* TODO: Infer types based on the tool result*/}
                {/* @ts-expect-error */}
                <AccountsBalance props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'sendMoney' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <SendConfirm props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'payBill' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <BillConfirm props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'getTransactionHistory' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <TransactionHistory props={tool.result} />
              </BotCard>
            ) : null
          })
        ) : message.role === 'user' ? (
          <UserMessage>{message.content as string}</UserMessage>
        ) : message.role === 'assistant' &&
          typeof message.content === 'string' ? (
          <BotMessage content={message.content} />
        ) : null
    }))
}
