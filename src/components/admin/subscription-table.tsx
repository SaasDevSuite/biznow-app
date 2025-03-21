"use client"

import {useCallback, useEffect, useState} from "react";
import {Badge} from "@/components/ui/badge";
import {LockIcon, UnlockIcon} from "lucide-react";
import {Column, GenericTable} from "@/components/custom/table";
import {getAllSubscriptions} from "@/actions/subscription/query";
import {format} from "date-fns";
import {SubscriptionStatus, User} from "@prisma/client";
import {toggleSubscriptionStatus} from "@/actions/subscription/operations";

interface SubscriptionTableProps {
    status: string
    isExceptStatus?: boolean
}

export function SubscriptionTable(
    {status = "ACTIVE", isExceptStatus = false}: SubscriptionTableProps
) {
    const [searchQuery, setSearchQuery] = useState("");
    const [subscriptions, setSubscriptions] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 3;

    const fetchSubscriptions = useCallback(async (search = "") => {
        const response = await getAllSubscriptions(page, pageSize, search, status, isExceptStatus);
        setSubscriptions(response.subscriptions);
        setTotalPages(response.totalPages);
    }, [isExceptStatus, page, status]);

    useEffect(() => {
        fetchSubscriptions(searchQuery);
    }, [page, searchQuery, pageSize, fetchSubscriptions]);

    const toggleActivation = async (userId: string, status: string) => {
        await toggleSubscriptionStatus(userId, status as any);
        await fetchSubscriptions(searchQuery);
    };

    const columns: Column<any>[] = [
        {key: "id", label: "Id"},
        {key: "user", label: "User", render: (value: User) => value.name || "—"},
        {
            key: "status", label: "Status", render: (value: string) => (
                <>
                    {value === SubscriptionStatus.ACTIVE && <Badge variant="default">Active</Badge>}
                    {value === SubscriptionStatus.DEACTIVATED && <Badge variant="destructive"> Inactive</Badge>}
                    {value === SubscriptionStatus.CANCELED && <Badge variant="secondary"> Canceled</Badge>}
                </>
            )
        },
        {key: "startDate", label: "Start Date", render: (value: Date) => `${format(value, 'yyyy-MM-dd')}` || "—"},
        {key: "endDate", label: "End Date", render: (value: Date) => `${format(value, 'yyyy-MM-dd')}` || "—"},
    ];

    const actions = (subscription: { id: string; status: string }) => [
        {
            label: status === "ACTIVE" ? "Deactivate" : "Activate",
            icon: status === "ACTIVE" ? <LockIcon/> : <UnlockIcon/>,
            onClick: () => toggleActivation(subscription.id, status === "ACTIVE" ? SubscriptionStatus.DEACTIVATED : SubscriptionStatus.ACTIVE),
        }
    ];

    return (
        <GenericTable
            columns={columns}
            data={subscriptions}
            actions={actions}
            pageSize={pageSize}
            onSearch={setSearchQuery}
            page={page}
            totalPages={totalPages}
            onChangePage={setPage}
        />
    );
}
