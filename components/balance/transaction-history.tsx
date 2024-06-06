/**
 * v0 by Vercel.
 * @see https://v0.dev/t/oGuJ0IxISA7
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { format, parseISO } from 'date-fns'

export default function TransactionHistory({
  props: events
}: {
  props: {
    actor: string
    date: string
    type: 'in' | 'out'
    amount: string
  }[]
}) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-lg font-semibold">Checking Account</h3>
          <p className="text-gray-500 dark:text-gray-400">$4,523.45</p>
        </div>
        <Button variant="outline" size="sm">
          View Statement
        </Button>
      </CardHeader>
      <CardContent className="overflow-auto pt-6">
        <div className="space-y-4">
          {events.map((event, idx) => {
            if (event.type === 'in') {
              return (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{event.actor}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(parseISO(event.date), 'dd LLL, yyyy')}
                    </p>
                  </div>
                  <p className="text-red-500 dark:text-red-400">
                    -{event.amount}
                  </p>
                </div>
              )
            }

            if (event.type === 'out') {
              return (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{event.actor}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(parseISO(event.date), 'dd LLL, yyyy')}
                    </p>
                  </div>
                  <p className="text-green-500 dark:text-green-400">
                    +{event.amount}
                  </p>
                </div>
              )
            }
          })}
        </div>
      </CardContent>
    </Card>
  )
}
