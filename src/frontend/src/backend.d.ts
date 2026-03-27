import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Size {
    height: number;
    length: number;
    width: number;
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
export interface OrderFileEntry {
    hash: string;
    name: string;
    mimeType: string;
    uploadedAt: bigint;
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
export interface Production {
    designFileCAD: boolean;
    colorMatchedWithSample: boolean;
    sizeVerifiedDuringProduction: boolean;
    yarnDyingProcess: boolean;
}
export interface Dispatch {
    transportBooked: boolean;
    dispatchDateConfirmed: boolean;
    trackingShared: boolean;
    clientInformed: boolean;
}
export enum OverallStatus {
    completed = "completed",
    dispatched = "dispatched",
    inProduction = "inProduction",
    waitingForApproval = "waitingForApproval",
    packaging = "packaging"
}
export interface backendInterface {
    addOrderFile(orderId: bigint, hash: string, name: string, mimeType: string): Promise<void>;
    createOrder(input: OrderInput): Promise<bigint>;
    deleteOrder(id: bigint): Promise<void>;
    getAllOrders(): Promise<Array<OrderData>>;
    getOrder(id: bigint): Promise<OrderData>;
    getOrderFiles(orderId: bigint): Promise<Array<OrderFileEntry>>;
    getOrdersByClientName(clientName: string): Promise<Array<OrderData>>;
    removeOrderFile(orderId: bigint, hash: string): Promise<void>;
    updateOrder(id: bigint, input: OrderInput): Promise<void>;
}
