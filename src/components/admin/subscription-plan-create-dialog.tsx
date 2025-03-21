"use client"
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {Button} from "@/components/ui/button"
import {PlusCircle} from "lucide-react"
import {useState} from "react";
import {createPlan} from "@/actions/plan/operations";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    description: z.string().optional(),
    price: z.coerce.number().positive({
        message: "Price must be a positive number.",
    }),
    currency: z.string().min(1, {
        message: "Please select a currency.",
    }),
    interval: z.string().min(1, {
        message: "Please select a billing interval.",
    }),
})

type FormValues = z.infer<typeof formSchema>

interface CreatePlanDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    afterCreate?: () => void
}

export function CreatePlanDialog({open, onOpenChange, afterCreate}: CreatePlanDialogProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            currency: "USD",
            interval: "monthly",
        },
    })

    const onSubmit = async (data: FormValues) => {
        // Here you would typically send the data to your API
        await createPlan({
            name: data.name,
            description: data.description,
            price: data.price,
            currency: data.currency,
            interval: data.interval
        })

        // For demo purposes, we'll just close the dialog
        form.reset()
        onOpenChange(false)
        afterCreate?.()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Plan</DialogTitle>
                    <DialogDescription>Create a new subscription plan. Plans cannot be edited after
                        creation.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Basic Plan" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="For individuals and small teams" {...field}
                                                  value={field.value || ""}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Currency</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select currency"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="USD">EUR</SelectItem>
                                                <SelectItem value="LKR">LKR</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="interval"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Billing Interval</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select interval"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                                            <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                                            <SelectItem value="SEMIANNUALLY">Semiannually</SelectItem>
                                            <SelectItem value="ANNUALLY">Annually</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Create Plan</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

interface CreatePlanDialogButtonProps {
    afterCreate?: () => void
}

export function CreatePlanButton(
    {
        afterCreate
    }: CreatePlanDialogButtonProps
) {
    const [showDialog, setShowDialog] = useState(false)

    return (
        <>
            <Button onClick={() => setShowDialog(true)}>
                <PlusCircle className="mr-2 h-4 w-4"/>
                Create Plan
            </Button>
            <CreatePlanDialog afterCreate={afterCreate} open={showDialog} onOpenChange={setShowDialog}/>
        </>
    )
}

