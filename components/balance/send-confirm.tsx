/**
 * v0 by Vercel.
 * @see https://v0.dev/t/Ngyl0r8f0B7
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

export default function SendConfirm({
  props
}: {
  props: {
    sourceAccount: { holder: string; name: string; number: string }
    destinationAccount: { holder: string; name: string; number: string }
    amount: string
    remarks?: string
  }
}) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Confirm Transfer</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            From
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
              <UserIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <div className="font-medium">John Doe</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {props.sourceAccount.name}
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            To
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
              <UserIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <div className="font-medium">
                {props.destinationAccount.holder}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {props.destinationAccount.number}
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Amount
          </div>
          <div className="text-3xl font-bold">{props.amount}</div>
        </div>
        <div className="grid gap-2">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Remarks
          </div>
          <div className="">{props.remarks || '-'}</div>
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

function UserIcon(props: { className?: string }) {
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
