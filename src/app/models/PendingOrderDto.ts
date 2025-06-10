export interface PendingOrderDto {
  userId: number;
  stockId: number;
  quantity: number;
  subTotalPrice: number;
  extraCharges: number;
}