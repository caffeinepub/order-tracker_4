import Order "mo:core/Order";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Prim "mo:prim";
import Storage "blob-storage/Storage";

actor {
  func boolToNat(b : Bool) : Nat {
    if (b) { 1 } else { 0 };
  };

  type Size = {
    length : Float;
    width : Float;
    height : Float;
  };

  module Size {
    public func compare(size1 : Size, size2 : Size) : Order.Order {
      switch (Float.compare(size1.length, size2.length)) {
        case (#equal) {
          switch (Float.compare(size1.width, size2.width)) {
            case (#equal) { Float.compare(size1.height, size2.height) };
            case (order) { order };
          };
        };
        case (order) { order };
      };
    };
  };

  type PreProduction = {
    sizeConfirmed : Bool;
    colorReferenceConfirmed : Bool;
    sampleApproved : Bool;
    materialConfirmedAvailable : Bool;
    timelineCommitted : Bool;
  };

  module PreProduction {
    public func compare(stage1 : PreProduction, stage2 : PreProduction) : Order.Order {
      let boolCompare = Nat.compare(boolToNat(stage1.sizeConfirmed), boolToNat(stage2.sizeConfirmed));
      switch (boolCompare) {
        case (#equal) {
          let colorRefCompare = Nat.compare(boolToNat(stage1.colorReferenceConfirmed), boolToNat(stage2.colorReferenceConfirmed));
          switch (colorRefCompare) {
            case (#equal) {
              let sampleCompare = Nat.compare(boolToNat(stage1.sampleApproved), boolToNat(stage2.sampleApproved));
              switch (sampleCompare) {
                case (#equal) {
                  let materialCompare = Nat.compare(boolToNat(stage1.materialConfirmedAvailable), boolToNat(stage2.materialConfirmedAvailable));
                  switch (materialCompare) {
                    case (#equal) {
                      Nat.compare(boolToNat(stage1.timelineCommitted), boolToNat(stage2.timelineCommitted));
                    };
                    case (order) { order };
                  };
                };
                case (order) { order };
              };
            };
            case (order) { order };
          };
        };
        case (order) { order };
      };
    };
  };

  type Production = {
    designFileCAD : Bool;
    yarnDyingProcess : Bool;
    colorMatchedWithSample : Bool;
    sizeVerifiedDuringProduction : Bool;
  };

  module Production {
    public func compare(stage1 : Production, stage2 : Production) : Order.Order {
      let boolCompare = Nat.compare(boolToNat(stage1.designFileCAD), boolToNat(stage2.designFileCAD));
      switch (boolCompare) {
        case (#equal) {
          let yarnCompare = Nat.compare(boolToNat(stage1.yarnDyingProcess), boolToNat(stage2.yarnDyingProcess));
          switch (yarnCompare) {
            case (#equal) {
              let colorMatchCompare = Nat.compare(boolToNat(stage1.colorMatchedWithSample), boolToNat(stage2.colorMatchedWithSample));
              switch (colorMatchCompare) {
                case (#equal) {
                  Nat.compare(boolToNat(stage1.sizeVerifiedDuringProduction), boolToNat(stage2.sizeVerifiedDuringProduction));
                };
                case (order) { order };
              };
            };
            case (order) { order };
          };
        };
        case (order) { order };
      };
    };
  };

  type Packaging = {
    correctPackagingTypeUsed : Bool;
    labelsCorrect : Bool;
    quantityCounted : Bool;
    photosTaken : Bool;
  };

  module Packaging {
    public func compare(stage1 : Packaging, stage2 : Packaging) : Order.Order {
      let boolCompare = Nat.compare(boolToNat(stage1.correctPackagingTypeUsed), boolToNat(stage2.correctPackagingTypeUsed));
      switch (boolCompare) {
        case (#equal) {
          let labelsCompare = Nat.compare(boolToNat(stage1.labelsCorrect), boolToNat(stage2.labelsCorrect));
          switch (labelsCompare) {
            case (#equal) {
              let quantityCompare = Nat.compare(boolToNat(stage1.quantityCounted), boolToNat(stage2.quantityCounted));
              switch (quantityCompare) {
                case (#equal) {
                  Nat.compare(boolToNat(stage1.photosTaken), boolToNat(stage2.photosTaken));
                };
                case (order) { order };
              };
            };
            case (order) { order };
          };
        };
        case (order) { order };
      };
    };
  };

  type Dispatch = {
    transportBooked : Bool;
    dispatchDateConfirmed : Bool;
    clientInformed : Bool;
    trackingShared : Bool;
  };

  module Dispatch {
    public func compare(stage1 : Dispatch, stage2 : Dispatch) : Order.Order {
      let boolCompare = Nat.compare(boolToNat(stage1.transportBooked), boolToNat(stage2.transportBooked));
      switch (boolCompare) {
        case (#equal) {
          let dateCompare = Nat.compare(boolToNat(stage1.dispatchDateConfirmed), boolToNat(stage2.dispatchDateConfirmed));
          switch (dateCompare) {
            case (#equal) {
              let clientCompare = Nat.compare(boolToNat(stage1.clientInformed), boolToNat(stage2.clientInformed));
              switch (clientCompare) {
                case (#equal) {
                  Nat.compare(boolToNat(stage1.trackingShared), boolToNat(stage2.trackingShared));
                };
                case (order) { order };
              };
            };
            case (order) { order };
          };
        };
        case (order) { order };
      };
    };
  };

  type ConfirmationChecklist = {
    preProduction : PreProduction;
    production : Production;
    packaging : Packaging;
    dispatch : Dispatch;
  };

  module ConfirmationChecklist {
    public func compareByPreProduction(checklist1 : ConfirmationChecklist, checklist2 : ConfirmationChecklist) : Order.Order {
      PreProduction.compare(checklist1.preProduction, checklist2.preProduction);
    };

    public func compareByProduction(checklist1 : ConfirmationChecklist, checklist2 : ConfirmationChecklist) : Order.Order {
      Production.compare(checklist1.production, checklist2.production);
    };

    public func compareByPackaging(checklist1 : ConfirmationChecklist, checklist2 : ConfirmationChecklist) : Order.Order {
      Packaging.compare(checklist1.packaging, checklist2.packaging);
    };

    public func compareByDispatch(checklist1 : ConfirmationChecklist, checklist2 : ConfirmationChecklist) : Order.Order {
      Dispatch.compare(checklist1.dispatch, checklist2.dispatch);
    };
  };

  type OverallStatus = {
    #waitingForApproval;
    #inProduction;
    #packaging;
    #dispatched;
    #completed;
  };

  module OverallStatus {
    public func compare(status1 : OverallStatus, status2 : OverallStatus) : Order.Order {
      let statusToNat = func(s : OverallStatus) : Nat {
        switch (s) {
          case (#waitingForApproval) { 0 };
          case (#inProduction) { 1 };
          case (#packaging) { 2 };
          case (#dispatched) { 3 };
          case (#completed) { 4 };
        };
      };

      Nat.compare(statusToNat(status1), statusToNat(status2));
    };
  };

  type OrderData = {
    id : Nat;
    orderNumber : Text;
    clientName : Text;
    productType : Text;
    size : Size;
    color : Text;
    quantity : Nat;
    dispatchDate : Time.Time;
    overallStatus : OverallStatus;
    confirmationChecklist : ConfirmationChecklist;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  module OrderData {
    public func compareByOrderNumber(order1 : OrderData, order2 : OrderData) : Order.Order {
      Text.compare(order1.orderNumber, order2.orderNumber);
    };

    public func compareByClientName(order1 : OrderData, order2 : OrderData) : Order.Order {
      Text.compare(order1.clientName, order2.clientName);
    };

    public func compareByProductType(order1 : OrderData, order2 : OrderData) : Order.Order {
      Text.compare(order1.productType, order2.productType);
    };

    public func compareBySize(order1 : OrderData, order2 : OrderData) : Order.Order {
      Size.compare(order1.size, order2.size);
    };

    public func compareByColor(order1 : OrderData, order2 : OrderData) : Order.Order {
      Text.compare(order1.color, order2.color);
    };

    public func compareByQuantity(order1 : OrderData, order2 : OrderData) : Order.Order {
      Nat.compare(order1.quantity, order2.quantity);
    };

    public func compareByDispatchDate(order1 : OrderData, order2 : OrderData) : Order.Order {
      Int.compare(order1.dispatchDate, order2.dispatchDate);
    };

    public func compareByOverallStatus(order1 : OrderData, order2 : OrderData) : Order.Order {
      OverallStatus.compare(order1.overallStatus, order2.overallStatus);
    };

    public func compareByCreatedAt(order1 : OrderData, order2 : OrderData) : Order.Order {
      Int.compare(order1.createdAt, order2.createdAt);
    };

    public func compareByUpdatedAt(order1 : OrderData, order2 : OrderData) : Order.Order {
      Int.compare(order1.updatedAt, order2.updatedAt);
    };

    public func compareByPreProduction(order1 : OrderData, order2 : OrderData) : Order.Order {
      PreProduction.compare(order1.confirmationChecklist.preProduction, order2.confirmationChecklist.preProduction);
    };

    public func compareByProduction(order1 : OrderData, order2 : OrderData) : Order.Order {
      Production.compare(order1.confirmationChecklist.production, order2.confirmationChecklist.production);
    };

    public func compareByPackaging(order1 : OrderData, order2 : OrderData) : Order.Order {
      Packaging.compare(order1.confirmationChecklist.packaging, order2.confirmationChecklist.packaging);
    };

    public func compareByDispatch(order1 : OrderData, order2 : OrderData) : Order.Order {
      Dispatch.compare(order1.confirmationChecklist.dispatch, order2.confirmationChecklist.dispatch);
    };
  };

  type OrderInput = {
    orderNumber : Text;
    clientName : Text;
    productType : Text;
    size : Size;
    color : Text;
    quantity : Nat;
    dispatchDate : Time.Time;
    overallStatus : OverallStatus;
    confirmationChecklist : ConfirmationChecklist;
  };

  var nextId = 0;

  let orders = Map.empty<Nat, OrderData>();

  func getOrderInternal(id : Nat) : OrderData {
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order does not exist") };
      case (?order) { order };
    };
  };

  public shared ({ caller }) func createOrder(input : OrderInput) : async Nat {
    let id = nextId;
    nextId += 1;
    let now = Time.now();
    let order : OrderData = {
      id;
      orderNumber = input.orderNumber;
      clientName = input.clientName;
      productType = input.productType;
      size = input.size;
      color = input.color;
      quantity = input.quantity;
      dispatchDate = input.dispatchDate;
      overallStatus = input.overallStatus;
      confirmationChecklist = input.confirmationChecklist;
      createdAt = now;
      updatedAt = now;
    };
    orders.add(id, order);
    id;
  };

  public shared ({ caller }) func updateOrder(id : Nat, input : OrderInput) : async () {
    ignore getOrderInternal(id);
    let updatedOrder : OrderData = {
      id;
      orderNumber = input.orderNumber;
      clientName = input.clientName;
      productType = input.productType;
      size = input.size;
      color = input.color;
      quantity = input.quantity;
      dispatchDate = input.dispatchDate;
      overallStatus = input.overallStatus;
      confirmationChecklist = input.confirmationChecklist;
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    orders.add(id, updatedOrder);
  };

  public shared ({ caller }) func deleteOrder(id : Nat) : async () {
    ignore getOrderInternal(id);
    orders.remove(id);
  };

  public query ({ caller }) func getOrder(id : Nat) : async OrderData {
    getOrderInternal(id);
  };

  public query ({ caller }) func getAllOrders() : async [OrderData] {
    orders.values().toArray();
  };

  public query ({ caller }) func getOrdersByClientName(clientName : Text) : async [OrderData] {
    orders.values().filter(func(order) { order.clientName == clientName }).toArray();
  };

  // ── Blob Storage ──────────────────────────────────────────────────────────

  transient let _caffeineStorageState : Storage.State = Storage.new();

  public shared ({ caller }) func _caffeineStorageRefillCashier(
    refillInformation : ?{ proposed_top_up_amount : ?Nat }
  ) : async { success : ?Bool; topped_up_amount : ?Nat } {
    let cashier = await Storage.getCashierPrincipal();
    if (cashier != caller) {
      Runtime.trap("Unauthorized access");
    };
    await Storage.refillCashier(_caffeineStorageState, cashier, refillInformation);
  };

  public shared ({ caller }) func _caffeineStorageUpdateGatewayPrincipals() : async () {
    await Storage.updateGatewayPrincipals(_caffeineStorageState);
  };

  public query ({ caller }) func _caffeineStorageBlobIsLive(hash : Blob) : async Bool {
    Prim.isStorageBlobLive(hash);
  };

  public query ({ caller }) func _caffeineStorageBlobsToDelete() : async [Blob] {
    if (not Storage.isAuthorized(_caffeineStorageState, caller)) {
      Runtime.trap("Unauthorized access");
    };
    let deadBlobs = Prim.getDeadBlobs();
    switch (deadBlobs) {
      case (null) { [] };
      case (?deadBlobs) { deadBlobs.sliceToArray(0, 10000) };
    };
  };

  public shared ({ caller }) func _caffeineStorageConfirmBlobDeletion(blobs : [Blob]) : async () {
    if (not Storage.isAuthorized(_caffeineStorageState, caller)) {
      Runtime.trap("Unauthorized access");
    };
    Prim.pruneConfirmedDeadBlobs(blobs);
    type GC = actor {
      __motoko_gc_trigger : () -> async ();
    };
    let myGC = actor (debug_show (Prim.getSelfPrincipal<system>())) : GC;
    await myGC.__motoko_gc_trigger();
  };

  public shared ({ caller }) func _caffeineStorageCreateCertificate(blobHash : Text) : async { method : Text; blob_hash : Text } {
    { method = "upload"; blob_hash = blobHash };
  };
};
