// Domain types for the Order Tracker application.
// These are the shared types used across all components.

export enum OverallStatus {
  waitingForApproval = "waitingForApproval",
  inProduction = "inProduction",
  packaging = "packaging",
  dispatched = "dispatched",
  completed = "completed",
}

export interface PreProduction {
  sizeConfirmed: boolean;
  colorReferenceConfirmed: boolean;
  sampleApproved: boolean;
  materialConfirmedAvailable: boolean;
  timelineCommitted: boolean;
}

export interface Production {
  designFileCAD: boolean;
  yarnDyingProcess: boolean;
  colorMatchedWithSample: boolean;
  sizeVerifiedDuringProduction: boolean;
}

export interface Packaging {
  correctPackagingTypeUsed: boolean;
  labelsCorrect: boolean;
  quantityCounted: boolean;
  photosTaken: boolean;
}

export interface Dispatch {
  transportBooked: boolean;
  dispatchDateConfirmed: boolean;
  clientInformed: boolean;
  trackingShared: boolean;
}

export interface ConfirmationChecklist {
  preProduction: PreProduction;
  production: Production;
  packaging: Packaging;
  dispatch: Dispatch;
}

export interface Size {
  length: number;
  width: number;
  height: number;
}

export interface OrderData {
  id: bigint;
  orderNumber: string;
  clientName: string;
  productType: string;
  color: string;
  size: Size;
  quantity: bigint;
  dispatchDate: bigint;
  overallStatus: OverallStatus;
  confirmationChecklist: ConfirmationChecklist;
}

export interface OrderInput {
  orderNumber: string;
  clientName: string;
  productType: string;
  color: string;
  size: Size;
  quantity: bigint;
  dispatchDate: bigint;
  overallStatus: OverallStatus;
  confirmationChecklist: ConfirmationChecklist;
}

export interface OrderFileEntry {
  hash: string;
  name: string;
  mimeType: string;
  uploadedAt: bigint;
}
