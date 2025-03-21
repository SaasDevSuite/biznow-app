"use client"

import {useCallback, useEffect, useState} from "react";
import {Badge} from "@/components/ui/badge";
import {Eye, UserCheck, UserX} from "lucide-react";
import {getUsers} from "@/actions/user/query";
import {toggleUserStatus} from "@/actions/user/operations";
import {GenericTable, Column} from "@/components/custom/table";

export function UserTable() {
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 3;

    const fetchUsers = useCallback(async (search = "") => {
        const response = await getUsers(page, pageSize, search);
        setUsers(response.users);
        setTotalPages(response.totalPages);
    }, [page, pageSize]);

    useEffect(() => {
        fetchUsers(searchQuery);
    }, [page, searchQuery, pageSize, fetchUsers]);

    const handleToggleStatus = async (userId: string) => {
        await toggleUserStatus(userId);
        await fetchUsers(searchQuery);
    };

    const columns: Column<any>[] = [
        {key: "username", label: "Username"},
        {key: "name", label: "Name", render: (value: string) => value || "—"},
        {key: "email", label: "Email", render: (value: string) => value || "—"},
        {
            key: "isActive", label: "Status", render: (value: boolean) => (
                <Badge variant={value ? "default" : "destructive"}>{value ? "Active" : "Inactive"}</Badge>
            )
        },
    ];

    const actions = (user: { id: string; isActive: boolean }) => [
        {
            label: "View details",
            icon: <Eye className="mr-2 h-4 w-4"/>,
            onClick: () => window.location.href = `/admin/user/${user.id}`
        },
        {
            label: user.isActive ? "Deactivate" : "Activate",
            icon: user.isActive ? <UserX className="mr-2 h-4 w-4"/> : <UserCheck className="mr-2 h-4 w-4"/>,
            onClick: () => handleToggleStatus(user.id)
        }
    ];

    return (
        <GenericTable
            columns={columns}
            data={users}
            actions={actions}
            pageSize={pageSize}
            onSearch={setSearchQuery}
            page={page}
            totalPages={totalPages}
            onChangePage={setPage}
        />
    );
}
