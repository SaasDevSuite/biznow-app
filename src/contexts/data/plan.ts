// Define the Plan type
export type PlanStatus = "ACTIVE" | "INACTIVE" | "CANCELED";

export interface Plan {
    id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    interval: string;
    status: PlanStatus;
    createdAt: Date;
    updatedAt: Date;
}