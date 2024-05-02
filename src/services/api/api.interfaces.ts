interface BaseResponse {
  code: number
  message: string
}

export interface BooleanResponse extends BaseResponse {
  data: boolean
}

export interface LoginResponse extends BaseResponse {
  data: { token: string }
}

export interface AccountInfoResponse extends BaseResponse {
  data: {
    gmtFirstInviteDate: number | null
    firstInviteReward: number | null
    inviteAmount: number
    totalAmount: number
    currentAmount: number
    rank: number
    userLevel: number
    userId: number
  }
}

export interface GameInfoResponse extends BaseResponse {
  data: {
    singleCoinValue: number
    coinPoolTotalCount: number
    coinPoolLeftCount: number
    coinPoolRecoverySpeed: number
    lastTimeStamp: number
  }
}

export interface BoostsInfoResponse extends BaseResponse {
  data: {
    specialBoxLeftRecoveryCount: number
    coinPoolLeftRecoveryCount: number
    singleCoinValue: number
    singleCoinLevel: number
    singleCoinUpgradeCost: number
    coinPoolRecoverySpeed: number
    coinPoolRecoveryLevel: number
    coinPoolRecoveryUpgradeCost: number
    coinPoolTotalCount: number
    coinPoolTotalLevel: number
    coinPoolTotalUpgradeCost: 200
  }
}

export interface CollectResponse extends BaseResponse {
  data: {
    collectAmount: number
    collectStatus: boolean
  }
}
