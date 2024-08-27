import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

// Seconds in one day
export const SECS_PER_DAY = 86_400;

/// Seconds in one month.
export const SECS_PER_MONTH = SECS_PER_DAY * 365 / 12;

export class Registrar {
  public constructor(
    public readonly governanceProgramId: PublicKey,
    public readonly realm: PublicKey,
    public readonly realmAuthority: PublicKey,
    public readonly governingTokenMint: PublicKey,

    /// Storage for voting configuration
    public readonly votingConfig: VotingConfig,
    /// Storage for deposit configuration
    public readonly depositConfig: DepositConfig,

    // The current value of reward amount per second.
    public readonly currentRewardAmountPerSecond: BN,

    /// The last time 'current_reward_amount_per_second' was rotated.
    public readonly lastRewardAmountPerSecondRotatedTs: number,

    /// The timestamp that rewards was last accrued at
    public readonly rewardAccrualTs: number,

    /// Accumulator of the total earned rewards rate since the opening
    public readonly rewardIndex: BN,

    /// Amount of rewards that were issued.
    public readonly issuedRewardAmount: BN,

    /// Total permanently locked amount.
    /// Depositions with lockup kind 'Constant' are considered permanently locked
    public readonly permanentlyLockedAmount: BN,

    /// Debug only: time offset, to allow tests to move forward in time.
    public readonly timeOffset: number,

    public readonly bump: number,
  ) { }
}

export class DepositConfig {
  public constructor(
    public readonly ordinaryDepositMinLockupDuration: LockupTimeDuration,
    public readonly nodeDepositLockupDuration: LockupTimeDuration,
    public readonly nodeSecurityDeposit: BN,
  ) { }
}

export class VotingConfig {
  public constructor(
    public readonly baselineVoteWeightScaledFactor: BN,
    public readonly maxExtraLockupVoteWeightScaledFactor: BN,
    public readonly lockupSaturationSecs: BN,
  ) { }
}

export class Lockup {
  constructor(public readonly kind: LockupKind, public readonly startTs: number) { }

  public endTs(): number {
    return this.startTs + this.kind.duration.seconds();
  }
}

export class LockupKind {
  public constructor(public readonly kindKind: LockupKindKind, public readonly duration: LockupTimeDuration) { }

  public static parse(jsonObj: any): LockupKind {
    if (jsonObj.constant != undefined) {
      const kindObj: any = (jsonObj.constant as any)["0"];
      return new LockupKind(LockupKindKind.Constant, LockupTimeDuration.parse(kindObj));
    } else if (jsonObj.daily != null) {
      const periods: any = (jsonObj.daily as any)["0"];
      return new LockupKind(LockupKindKind.Daily, LockupTimeDuration.ofDays(periods));
    } else if (jsonObj.monthly != null) {
      const periods: any = (jsonObj.monthly as any)["0"];
      return new LockupKind(LockupKindKind.Monthly, LockupTimeDuration.ofMonths(periods));
    } else {
      throw `Illegal lockup kind: ${jsonObj}`
    }
  }
}

export const enum LockupKindKind {
  Daily,
  Monthly,
  Constant,
}

export class LockupTimeDuration {
  public unit: { day: {} } | { month: {} };
  public constructor(public periods: number, dayMonth: 'day' | 'month') {
    if (dayMonth === 'day') {
      this.unit = { day: {} };
    } else {
      this.unit = { month: {} };
    }
  }

  public static ofDays(days: number): LockupTimeDuration {
    return new LockupTimeDuration(days, 'day');
  }

  public static ofMonths(months: number): LockupTimeDuration {
    return new LockupTimeDuration(months, 'month');
  }

  public seconds(): number {
    if ((this.unit as any).day != undefined) {
      return SECS_PER_DAY * this.periods;
    } else {
      return SECS_PER_MONTH * this.periods;
    }
  }

  public static parse(jsonObj: any): LockupTimeDuration {
    const unitObj: any = jsonObj.unit;
    let unit: 'day' | 'month';
    if (unitObj.day != undefined) {
      unit = 'day'
    } else if (unitObj.month != undefined) {
      unit = 'month'
    } else {
      throw `Illegal unit json object: ${unitObj}`
    }
    return new LockupTimeDuration(jsonObj.periods, unit);
  }
}

export class VoterInfo {
  public constructor(
    /// Voter's total voting power
    public readonly votingPower: BN,
    /// Voter's total voting power, when ignoring any effects from lockup
    public readonly votingPowerBaseline: BN,
    /// Accumulated reward amount
    public readonly rewardAmount: BN,
    /// DepositEntry info array
    public readonly depositEntries: (DepositEntryInfo | null)[],
  ) {

  }

  public static parse(jsonObj: any): VoterInfo {
    const depositEntries: (DepositEntryInfo | null)[] = [];
    for (let entry of jsonObj.depositEntries as any[]) {
      if (entry != null) {
        const lockupData = entry.lockup;
        const lockupKindData = lockupData.kind;
        const lockupKind = LockupKind.parse(lockupKindData);
        const lockup = new Lockup(lockupKind, (lockupData.startTs as BN).toNumber());

        let vestingInfo: VestingInfo | null = null;
        if (entry.vesting != null) {
          vestingInfo = new VestingInfo(entry.vesting.rate, (entry.vesting.nextTimestamp as BN).toNumber());
        }

        const depositEntry = new DepositEntryInfo(
          lockup,
          entry.amountLocked,
          entry.amountUnlocked,
          entry.votingPower,
          entry.votingPowerBaseline,
          vestingInfo
        );

        depositEntries.push(depositEntry);
      } else {
        depositEntries.push(null);
      }
    }

    return new VoterInfo(
      jsonObj.votingPower,
      jsonObj.votingPowerBaseline,
      jsonObj.rewardAmount,
      depositEntries
    );
  }

  /**
   * @returns Total amount of tokens the voter has deposited
   */
  public amountDeposited(): BN {
    let total = new BN(0);
    for (let entry of this.depositEntries) {
      if (entry != null) {
        total = total.add(entry.amountDeposited());
      }
    }

    return total;
  }

  /**
   * @returns Amount of tokens that was permanently locked (non-linear-vesting)
   */
  public amountPermanentlyLocked(): BN {
    let total = new BN(0);
    for (let entry of this.depositEntries) {
      if (entry != null && !entry.isVesting()) {
        total = total.add(entry.amountLocked);
      }
    }

    return total;
  }

  /**
   * @returns Amount of tokens that was permanently locked in ordinary type
   */
  public amountOrdinaryPermanentlyLocked(): BN {
    return this.amountPermanentlyLocked().sub(this.amountNodePermanentlyLocked());
  }

  /**
   * @returns Amount of tokens that was permanently locked in node type
   */
  public amountNodePermanentlyLocked(): BN {
    const nodeDepositEntry = this.getNodeDepositEntry();
    return nodeDepositEntry != null ? nodeDepositEntry.amountDeposited() : new BN(0);
  }

  /**
   * @returns Amount of tokens that was at the stage of linear vesting
   */
  public amountLinearVesting(): BN {
    return this.amountVestingLocked().add(this.amountVestingUnlocked());
  }

  /**
   * @returns Amount of tokens that was vesting locked (linear-vesting)
   */
  public amountVestingLocked(): BN {
    let total = new BN(0);
    for (let entry of this.depositEntries) {
      if (entry != null && entry.isVesting()) {
        total = total.add(entry.amountLocked);
      }
    }

    return total;
  }

  /**
   * @returns Amount of tokens that has been vesting unlocked (ready for withdraw)
   */
  public amountVestingUnlocked(): BN {
    let total = new BN(0);
    for (let entry of this.depositEntries) {
      if (entry != null && entry.isVesting()) {
        total = total.add(entry.amountUnlocked);
      }
    }

    return total;
  }

  /**
   * @returns The entry representing node deposit. 
   */
  public getNodeDepositEntryIndex(): number {
    return 0;
  }

  /**
   * @returns Whether voter has node deposit. 
   */
  public hasNodeDeposit(): boolean {
    return this.depositEntries[this.getNodeDepositEntryIndex()] != null;
  }

  /**
   * @returns The entry representing node deposit. 
   */
  public getNodeDepositEntry(): DepositEntryInfo | null {
    return this.depositEntries[this.getNodeDepositEntryIndex()];
  }

  /**
   * @returns First inactive deposit entry, -1 if not found.
   */
  public findInactiveDepositEntryIndex(): number {
    return this.depositEntries.findIndex((entry) => entry == null);
  }
}

export class DepositEntryInfo {
  public constructor(
    /// The lockup info 
    public readonly lockup: Lockup,
    /// Amount that is locked
    public readonly amountLocked: BN,
    /// Amount that is unlocked
    public readonly amountUnlocked: BN,
    /// Voting power implied by this deposit entry
    public readonly votingPower: BN,
    /// Voting power without any adjustments for lockup
    public readonly votingPowerBaseline: BN,
    /// Information about vesting, if any
    public readonly vesting: VestingInfo | null,
  ) { }

  /**
   * @returns Total amount deposited in this entry 
   */
  public amountDeposited(): BN {
    return this.amountLocked.add(this.amountUnlocked);
  }

  /**
   * @returns Whether this entry is linear vesting entry 
   */
  public isVesting(): boolean {
    return this.lockup.kind.kindKind != LockupKindKind.Constant;
  }

}

export class VestingInfo {
  public constructor(
    /// Amount of tokens vested each period
    public readonly rate: BN,
    /// Time of the next upcoming vesting
    public readonly nextTimestamp: number,
  ) { }
}