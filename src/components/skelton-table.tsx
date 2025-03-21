import {Skeleton} from "@/components/ui/skeleton";


export default function TableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-[250px]"/>
                <Skeleton className="h-10 w-[200px]"/>
            </div>
            <div className="border rounded-md">
                <Skeleton className="h-[500px] w-full"/>
            </div>
        </div>
    )
}