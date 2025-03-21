"use client";

import {useEffect, useState} from "react";
import {Badge} from "@/components/ui/badge";
import {Column, GenericTable} from "@/components/custom/table";
import {getPlans} from "@/actions/plan/query";
import {Plan, PlanStatus} from "@prisma/client";
import {changePlanStatus} from "@/actions/plan/operations";
import {CreatePlanButton} from "@/components/admin/subscription-plan-create-dialog";


// Helper functions
const getStatusBadge = (status: PlanStatus) => {
    switch (status) {
        case "ACTIVE":
            return <Badge className="bg-green-500">Active</Badge>;
        case "INACTIVE":
            return <Badge className="bg-yellow-500">Inactive</Badge>;
        case "CANCELED":
            return <Badge className="bg-red-500">Canceled</Badge>;
    }
};

const formatCurrency = (price: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(price);

const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(date);

export function SubscriptionPlanTable() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    // For pagination demo purposes (here we assume one page)
    const [page, setPage] = useState(1);
    const totalPages = 1;
    const fetchPlans = async () => {
        const data: Plan[] = await getPlans();
        setPlans(data);
    };
    useEffect(
        () => {
            fetchPlans();
        },
        [],
    )

    // Handle status change directly (you could integrate a confirmation dialog here)
    const handleStatusChange = async (plan: Plan, newStatus: PlanStatus) => {


        await changePlanStatus(plan.id, newStatus);

        await fetchPlans()
    };

    // Define row actions as required by GenericTable
    const actions = (plan: Plan) => {
        const actionItems = [];
        if (plan.status !== "ACTIVE") {
            actionItems.push({
                label: "Mark as Active",
                icon: <></>, // Optionally add an icon here
                onClick: () => handleStatusChange(plan, "ACTIVE"),
            });
        }
        if (plan.status !== "INACTIVE") {
            actionItems.push({
                label: "Mark as Inactive",
                icon: <></>,
                onClick: () => handleStatusChange(plan, "INACTIVE"),
            });
        }
        if (plan.status !== "CANCELED") {
            actionItems.push({
                label: "Cancel Plan",
                icon: <></>,
                onClick: () => handleStatusChange(plan, "CANCELED"),
            });
        }
        return actionItems;
    };

    // Define columns for the table
    const columns: Column<Plan>[] = [
        {key: "name", label: "Name"},
        {
            key: "description",
            label: "Description",
            render: (value) => (value ? value : "-"),
        },
        {
            key: "price",
            label: "Price",
            render: (value, row) => formatCurrency(value, row.currency),
        },
        {
            key: "interval",
            label: "Interval",
            render: (value) => String(value),
        },
        {
            key: "status",
            label: "Status",
            render: (value) => getStatusBadge(value),
        },
        {
            key: "createdAt",
            label: "Created",
            render: (value) => formatDate(new Date(value)),
        },
    ];

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setPlans(plans.filter(plan => plan.name.toLowerCase().includes(query.toLowerCase())))
    };

    return (
        <GenericTable
            columns={columns}
            data={plans}
            actions={actions}
            onSearch={handleSearch}
            searchQuery={searchQuery}
            totalPages={totalPages}
            page={page}
            onChangePage={setPage}
            actionItems={
                <div className="flex items-center space-x-2">
                    <CreatePlanButton afterCreate={fetchPlans}/>
                </div>
            }
        />
    );
}
