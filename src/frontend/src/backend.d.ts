import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PreProduction {
    sampleApproved: boolean;
    colorReferenceConfirmed: boolean;
    materialConfirmedAvailable: boolean;
    timelineCommitted: boolean;
    sizeConfirmed: boolean;
}
export interface ConfirmationChecklist {
    dispatch: Dispatch;
    production: Production;
    preProduction: PreProduction;
    packaging: Packaging;
}
export type Time = bigint;
export interface Size {
    height: number;
    length: number;
    width: number;
}
export interface Production {
    designFileCAD: boolean;
    colorMatchedWithSample: boolean;
    sizeVerifiedDuringProduction: boolean;
    yarnDyingProcess: boolean;
}
export interface OrderInput {
    confirmationChecklist: ConfirmationChecklist;
    clientName: string;
    color: string;
    size: Size;
    dispatchDate: Time;
    productType: string;
    quantity: bigint;
    orderNumber: string;
    overallStatus: OverallStatus;
}
export interface Packaging {
    quantityCounted: boolean;
    labelsCorrect: boolean;
    photosTaken: boolean;
    correctPackagingTypeUsed: boolean;
}
export interface Dispatch {
    transportBooked: boolean;
    dispatchDateConfirmed: boolean;
    trackingShared: boolean;
    clientInformed: boolean;
}
export interface OrderData {
    id: bigint;
    confirmationChecklist: ConfirmationChecklist;
    clientName: string;
    createdAt: Time;
    color: string;
    size: Size;
    dispatchDate: Time;
    productType: string;
    updatedAt: Time;
    quantity: bigint;
    orderNumber: string;
    overallStatus: OverallStatus;
}
export enum OverallStatus {
    completed = "completed",
    dispatched = "dispatched",
    inProduction = "inProduction",
    waitingForApproval = "waitingForApproval",
    packaging = "packaging"
}
export interface backendInterface {
    createOrder(input: OrderInput): Promise<bigint>;
    deleteOrder(id: bigint): Promise<void>;
    getAllOrders(): Promise<Array<OrderData>>;
    getOrder(id: bigint): Promise<OrderData>;
    getOrdersByClientName(clientName: string): Promise<Array<OrderData>>;
    updateOrder(id: bigint, input: OrderInput): Promise<void>;
}
