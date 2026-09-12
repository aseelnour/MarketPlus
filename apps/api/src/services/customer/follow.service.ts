import { Follow } from "../../models/Follow.model";

export class FollowService {
  async getFollowedStores(guestId: string) {
    let follow = await Follow.findOne({ guestId }).populate("storeIds");
    if (!follow) {
      follow = new Follow({ guestId, storeIds: [] });
      await follow.save();
    }
    return follow;
  }

  async toggleFollow(guestId: string, storeId: string) {
    let follow = await Follow.findOne({ guestId });
    if (!follow) {
      follow = new Follow({ guestId, storeIds: [] });
    }

    const index = follow.storeIds.findIndex((id) => id.toString() === storeId);

    if (index > -1) {
      follow.storeIds.splice(index, 1); 
    } else {
      follow.storeIds.push(storeId as any); 
    }

    await follow.save();
    return follow.populate("storeIds");
  }
}

export const followService = new FollowService();
