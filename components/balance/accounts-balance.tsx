/**
 * v0 by Vercel.
 * @see https://v0.dev/t/Dxso6TQkX73
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Card, CardContent } from '@/components/ui/card'

export default function AccountsBalance({
  props: accountsBalance
}: {
  props: {
    account: { name: string; number: string }
    balance: string
  }[]
}) {
  return (
    <div className="mb-4 flex flex-col gap-2 overflow-y-scroll pb-4 text-sm sm:flex-row">
      {accountsBalance.map(({ account, balance }, idx) => (
        <Card key={idx} className="w-full max-w-md">
          <CardContent className="grid gap-6 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-medium">John Doe</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {account.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {account.number}
                </p>
              </div>
              <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
                <UserIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-4xl font-bold">{balance}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current Balance
                </p>
              </div>
              {/* <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/20">
                <CheckIcon className="h-6 w-6 text-green-500 dark:text-green-400" />
              </div> */}
            </div>
            {/* <div className="flex items-center justify-between">
          <Button variant="outline">Withdraw</Button>
          <Button>Deposit</Button>
        </div> */}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function CheckIcon(props: { className: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function UserIcon(props: { className: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
