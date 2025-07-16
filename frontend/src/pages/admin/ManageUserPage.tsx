"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { UserFormModal } from "@/components/ui/user-form-modal";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/types/user";
import type { Column, RowAction, TableAction, PaginationInfo, TableFilters, SortConfig } from "@/types/table";
import { getUsers, deleteUser, deleteUsers } from "@/services/user.service";

export default function ManageUserPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
    });
    const [filters, setFilters] = useState<TableFilters>({
        search: "",
        searchColumn: "full_name",
    });
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

    // Modal states
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [userModalMode, setUserModalMode] = useState<"create" | "update" | "view">("create");
    const [selectedUser, setSelectedUser] = useState<User | undefined>();
    const [confirmationModal, setConfirmationModal] = useState<{
        open: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
    }>({
        open: false,
        title: "",
        description: "",
        onConfirm: () => { },
    });

    const columns: Column<User>[] = [
        {
            key: "avatar_image_url",
            label: "Avatar",
            render: (value, user) => (
                <Avatar className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10">
                    <AvatarImage src={value} />
                    <AvatarFallback className="text-xs sm:text-sm">
                        {user.full_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            ),
        },
        {
            key: "full_name",
            label: "Họ và tên",
            sortable: true,
            filterable: true,
        },
        {
            key: "email",
            label: "Email",
            sortable: true,
            filterable: true,
        },
        {
            key: "position",
            label: "Chức vụ",
            sortable: true,
            filterable: true,
            render: (value) => (
                <Badge variant="secondary">{value}</Badge>
            ),
        },
        {
            key: "created_at",
            label: "Ngày tham gia",
            sortable: true,
            render: (value) => new Date(value).toLocaleDateString('vi-VN'),
        },
    ];

    const rowActions: RowAction<User>[] = [
        {
            label: "Xem chi tiết",
            icon: <Eye className="h-4 w-4" />,
            onClick: (user) => {
                setSelectedUser(user);
                setUserModalMode("view");
                setUserModalOpen(true);
            },
        },
        {
            label: "Chỉnh sửa",
            icon: <Edit className="h-4 w-4" />,
            onClick: (user) => {
                setSelectedUser(user);
                setUserModalMode("update");
                setUserModalOpen(true);
            },
        },
        {
            label: "Xóa",
            icon: <Trash2 className="h-4 w-4" />,
            variant: "destructive",
            onClick: (user) => {
                setConfirmationModal({
                    open: true,
                    title: "Xác nhận xóa người dùng",
                    description: `Bạn có chắc chắn muốn xóa người dùng "${user.full_name}"? Hành động này không thể hoàn tác.`,
                    onConfirm: () => handleDeleteUser(user.id),
                });
            },
            confirmation: {
                title: "Xác nhận xóa người dùng",
                description: "Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.",
            },
        },
    ];

    const tableActions: TableAction<User>[] = [
        {
            label: "Xóa nhiều",
            icon: <Trash2 className="h-4 w-4" />,
            variant: "destructive",
            onClick: (selectedUsers) => {
                setConfirmationModal({
                    open: true,
                    title: "Xác nhận xóa nhiều người dùng",
                    description: `Bạn có chắc chắn muốn xóa ${selectedUsers.length} người dùng đã chọn? Hành động này không thể hoàn tác.`,
                    onConfirm: () => handleDeleteMultipleUsers(selectedUsers.map(u => u.id)),
                });
            },
        },
    ];

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getUsers({
                ...filters,
                page: pagination.page,
                limit: pagination.pageSize,
                sortColumn: sortConfig?.key,
                sortDirection: sortConfig?.direction,
            });

            setUsers(response.items);
            setPagination(prev => ({
                ...prev,
                total: response.totalCount,
                totalPages: response.totalPages,
            }));
        } catch (error) {
            toast.error("Lỗi khi tải danh sách người dùng");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            await deleteUser(userId);
            toast.success("Xóa người dùng thành công");
            fetchUsers();
        } catch (error) {
            toast.error("Lỗi khi xóa người dùng");
            console.error(error);
        }
    };

    const handleDeleteMultipleUsers = async (userIds: string[]) => {
        try {
            await deleteUsers(userIds);
            toast.success(`Xóa ${userIds.length} người dùng thành công`);
            fetchUsers();
        } catch (error) {
            toast.error("Lỗi khi xóa người dùng");
            console.error(error);
        }
    };

    const handleCreateUser = () => {
        setSelectedUser(undefined);
        setUserModalMode("create");
        setUserModalOpen(true);
    };

    const handlePaginationChange = (page: number, pageSize: number) => {
        setPagination(prev => ({ ...prev, page, pageSize }));
    };

    const handleFiltersChange = (newFilters: TableFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filtering
    };

    const handleSortChange = (newSortConfig: SortConfig | null) => {
        setSortConfig(newSortConfig);
    };

    const handleUserFormSuccess = () => {
        fetchUsers();
    };

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, pagination.pageSize, filters, sortConfig]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
                    <p className="text-muted-foreground">
                        Quản lý tất cả người dùng trong hệ thống
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách người dùng</CardTitle>
                    <CardDescription>
                        Tổng cộng {pagination.total} người dùng
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={users}
                        columns={columns}
                        loading={loading}
                        pagination={pagination}
                        onPaginationChange={handlePaginationChange}
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        sortConfig={sortConfig}
                        onSortChange={handleSortChange}
                        actions={tableActions}
                        rowActions={rowActions}
                        onCreateClick={handleCreateUser}
                        createButtonLabel="Thêm người dùng mới"
                    />
                </CardContent>
            </Card>

            <UserFormModal
                open={userModalOpen}
                onOpenChange={setUserModalOpen}
                mode={userModalMode}
                user={selectedUser}
                onSuccess={handleUserFormSuccess}
            />

            <ConfirmationModal
                open={confirmationModal.open}
                onOpenChange={(open) => setConfirmationModal(prev => ({ ...prev, open }))}
                title={confirmationModal.title}
                description={confirmationModal.description}
                onConfirm={confirmationModal.onConfirm}
                variant="destructive"
                confirmText="Xóa"
                cancelText="Hủy"
            />
        </div>
    );
}
