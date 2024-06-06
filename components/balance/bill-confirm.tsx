/**
 * v0 by Vercel.
 * @see https://v0.dev/t/njzmMn2uDn0
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export default function BillConfirm({
  props
}: {
  props: {
    billing: { name: string; number: string }
    account: { name: string; number: string; holder: string }
    amount: string
  }
}) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Bill Payment Confirmation</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Biller
            </div>
            <p>{props.billing.name}</p>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Billing Number
            </div>
            <p>{props.billing.number}</p>
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Payment Method
          </div>
          <p>{props.account.name}</p>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Payment Amount
          </div>
          <p className="text-2xl font-bold">{props.amount}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Abort</Button>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          Proceed
        </Button>
      </CardFooter>
    </Card>
  )
}
