export type VoterStakeRegistry = {
  "version": "0.1.0",
  "name": "voter_stake_registry",
  "docs": [
    "# Introduction",
    "",
    "The governance registry is an \"addin\" to the SPL governance program that",
    "allows one to both vote with many different ypes of tokens for voting and to",
    "scale voting power as a linear function of time locked--subject to some",
    "maximum upper bound.",
    "",
    "The flow for voting with this program is as follows:",
    "",
    "- Create a SPL governance realm.",
    "- Create a governance registry account.",
    "- Add exchange rates for any tokens one wants to deposit. For example,",
    "if one wants to vote with tokens A and B, where token B has twice the",
    "voting power of token A, then the exchange rate of B would be 2 and the",
    "exchange rate of A would be 1.",
    "- Create a voter account.",
    "- Deposit tokens into this program, with an optional lockup period.",
    "- Vote.",
    "",
    "Upon voting with SPL governance, a client is expected to call",
    "`decay_voting_power` to get an up to date measurement of a given `Voter`'s",
    "voting power for the given slot. If this is not done, then the transaction",
    "will fail (since the SPL governance program will require the measurement",
    "to be active for the current slot).",
    "",
    "# Interacting with SPL Governance",
    "",
    "This program does not directly interact with SPL governance via CPI.",
    "Instead, it simply writes a `VoterWeightRecord` account with a well defined",
    "format, which is then used by SPL governance as the voting power measurement",
    "for a given user.",
    "",
    "# Max Vote Weight",
    "",
    "Given that one can use multiple tokens to vote, the max vote weight needs",
    "to be a function of the total supply of all tokens, converted into a common",
    "currency. For example, if you have Token A and Token B, where 1 Token B =",
    "10 Token A, then the `max_vote_weight` should be `supply(A) + supply(B)*10`",
    "where both are converted into common decimals. Then, when calculating the",
    "weight of an individual voter, one can convert B into A via the given",
    "exchange rate, which must be fixed.",
    "",
    "Note that the above also implies that the `max_vote_weight` must fit into",
    "a u64."
  ],
  "instructions": [
    {
      "name": "createRegistrar",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The voting registrar. There can only be a single registrar",
            "per governance realm and governing mint."
          ]
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "circuitBreaker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "maxVoterWeightRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "An spl-governance realm",
            "",
            "realm is validated in the instruction:",
            "- realm is owned by the governance_program_id",
            "- realm_governing_token_mint must be the community or council mint",
            "- realm_authority is realm.authority"
          ]
        },
        {
          "name": "governanceProgramId",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The program id of the spl-governance program the realm belongs to."
          ]
        },
        {
          "name": "realmGoverningTokenMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Either the realm community mint or the council mint."
          ]
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "circuitBreakerProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "registrarBump",
          "type": "u8"
        },
        {
          "name": "maxVoterWeightRecordBump",
          "type": "u8"
        },
        {
          "name": "votingConfig",
          "type": {
            "defined": "VotingConfig"
          }
        },
        {
          "name": "depositConfig",
          "type": {
            "defined": "DepositConfig"
          }
        },
        {
          "name": "circuitBreakerConfig",
          "type": {
            "defined": "WindowedCircuitBreakerConfigV0"
          }
        }
      ]
    },
    {
      "name": "createVoter",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "The authority controling the voter. Must be the same as the",
            "`governing_token_owner` in the token owner record used with",
            "spl-governance."
          ]
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterWeightRecord",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The voter weight record is the account that will be shown to spl-governance",
            "to prove how much vote weight the voter has. See update_voter_weight_record."
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "voterBump",
          "type": "u8"
        },
        {
          "name": "voterWeightRecordBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "nodeDeposit",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "nodeReleaseDeposit",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "targetDepositEntryIndex",
          "type": "u8"
        }
      ]
    },
    {
      "name": "ordinaryDeposit",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "depositEntryIndex",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "duration",
          "type": {
            "defined": "LockupTimeDuration"
          }
        }
      ]
    },
    {
      "name": "ordinaryReleaseDeposit",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "depositEntryIndex",
          "type": "u8"
        },
        {
          "name": "targetDepositEntryIndex",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateVoterWeightRecord",
      "accounts": [
        {
          "name": "registrar",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voterWeightRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateMaxVoteWeight",
      "accounts": [
        {
          "name": "registrar",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governingTokenMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Registrar.realm_governing_token_mint"
          ]
        },
        {
          "name": "maxVoterWeightRecord",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeVoter",
      "accounts": [
        {
          "name": "registrar",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "solDestination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setTimeOffset",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "timeOffset",
          "type": "i64"
        }
      ]
    },
    {
      "name": "updateDepositConfig",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "depositConfig",
          "type": {
            "defined": "DepositConfig"
          }
        }
      ]
    },
    {
      "name": "updateVotingConfig",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "votingConfig",
          "type": {
            "defined": "VotingConfig"
          }
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenOwnerRecord",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The token_owner_record for the voter_authority. This is needed",
            "to be able to forbid withdraws while the voter is engaged with",
            "a vote or has an open proposal.",
            "",
            "token_owner_record is validated in the instruction:",
            "- owned by registrar.governance_program_id",
            "- for the registrar.realm",
            "- for the registrar.realm_governing_token_mint",
            "- governing_token_owner is voter_authority"
          ]
        },
        {
          "name": "voterWeightRecord",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Withdraws must update the voter weight record, to prevent a stale",
            "record being used to vote after the withdraw."
          ]
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "depositEntryIndex",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimReward",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "circuitBreaker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "circuitBreakerProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "logVoterInfo",
      "accounts": [
        {
          "name": "registrar",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "registrar",
      "docs": [
        "Instance of a voting rights distributor."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "governanceProgramId",
            "type": "publicKey"
          },
          {
            "name": "realm",
            "type": "publicKey"
          },
          {
            "name": "realmAuthority",
            "type": "publicKey"
          },
          {
            "name": "governingTokenMint",
            "type": "publicKey"
          },
          {
            "name": "votingConfig",
            "docs": [
              "Storage for voting configuration: voting_config + reserved1."
            ],
            "type": {
              "defined": "VotingConfig"
            }
          },
          {
            "name": "reserved1",
            "type": {
              "array": [
                "u64",
                5
              ]
            }
          },
          {
            "name": "depositConfig",
            "docs": [
              "Storage for deposit configuration: deposit_config + reserved2."
            ],
            "type": {
              "defined": "DepositConfig"
            }
          },
          {
            "name": "reserved2",
            "type": {
              "array": [
                "u64",
                5
              ]
            }
          },
          {
            "name": "currentRewardAmountPerSecond",
            "type": "u128"
          },
          {
            "name": "lastRewardAmountPerSecondRotatedTs",
            "docs": [
              "The last time 'current_reward_amount_per_second' was rotated."
            ],
            "type": "i64"
          },
          {
            "name": "rewardAccrualTs",
            "docs": [
              "The timestamp that rewards was last accrued at"
            ],
            "type": "i64"
          },
          {
            "name": "rewardIndex",
            "docs": [
              "Accumulator of the total earned rewards rate since the opening"
            ],
            "type": "u128"
          },
          {
            "name": "issuedRewardAmount",
            "docs": [
              "Amount of rewards that were issued."
            ],
            "type": "u64"
          },
          {
            "name": "permanentlyLockedAmount",
            "docs": [
              "Total permanently locked amount.",
              "Depositions with lockup kind 'Constant' are considered permanently locked"
            ],
            "type": "u64"
          },
          {
            "name": "timeOffset",
            "docs": [
              "Debug only: time offset, to allow tests to move forward in time."
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "maxVoterWeightRecordBump",
            "type": "u8"
          },
          {
            "name": "reserved3",
            "type": {
              "array": [
                "u8",
                14
              ]
            }
          },
          {
            "name": "reserved4",
            "type": {
              "array": [
                "u64",
                9
              ]
            }
          }
        ]
      }
    },
    {
      "name": "voter",
      "docs": [
        "User account for minting voting rights."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "voterAuthority",
            "type": "publicKey"
          },
          {
            "name": "registrar",
            "type": "publicKey"
          },
          {
            "name": "deposits",
            "type": {
              "array": [
                {
                  "defined": "DepositEntry"
                },
                16
              ]
            }
          },
          {
            "name": "rewardIndex",
            "docs": [
              "Global reward_index as of the most recent balance-changing action"
            ],
            "type": "u128"
          },
          {
            "name": "rewardClaimableAmount",
            "docs": [
              "Rewards amount available for claim"
            ],
            "type": "u64"
          },
          {
            "name": "voterBump",
            "type": "u8"
          },
          {
            "name": "voterWeightRecordBump",
            "type": "u8"
          },
          {
            "name": "reserved1",
            "type": {
              "array": [
                "u8",
                6
              ]
            }
          },
          {
            "name": "reserved2",
            "type": {
              "array": [
                "u64",
                8
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "WindowedCircuitBreakerConfigV0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "windowSizeSeconds",
            "type": "u64"
          },
          {
            "name": "thresholdType",
            "type": {
              "defined": "ThresholdType"
            }
          },
          {
            "name": "threshold",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "DepositEntryInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lockup",
            "docs": [
              "The lockup info"
            ],
            "type": {
              "defined": "Lockup"
            }
          },
          {
            "name": "amountLocked",
            "docs": [
              "Amount that is locked"
            ],
            "type": "u64"
          },
          {
            "name": "amountUnlocked",
            "docs": [
              "Amount that is unlocked"
            ],
            "type": "u64"
          },
          {
            "name": "votingPower",
            "docs": [
              "Voting power implied by this deposit entry"
            ],
            "type": "u64"
          },
          {
            "name": "votingPowerBaseline",
            "docs": [
              "Voting power without any adjustments for lockup"
            ],
            "type": "u64"
          },
          {
            "name": "vesting",
            "docs": [
              "Information about vesting, if any"
            ],
            "type": {
              "option": {
                "defined": "VestingInfo"
              }
            }
          }
        ]
      }
    },
    {
      "name": "VestingInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rate",
            "docs": [
              "Amount of tokens vested each period"
            ],
            "type": "u64"
          },
          {
            "name": "nextTimestamp",
            "docs": [
              "Time of the next upcoming vesting"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "DepositEntry",
      "docs": [
        "Bookkeeping for a single deposit for a given mint and lockup schedule."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lockup",
            "type": {
              "defined": "Lockup"
            }
          },
          {
            "name": "amountDepositedNative",
            "docs": [
              "Amount in deposited, in native currency. Withdraws of vested tokens",
              "directly reduce this amount.",
              "",
              "This directly tracks the total amount added by the user. They may",
              "never withdraw more than this amount."
            ],
            "type": "u64"
          },
          {
            "name": "amountInitiallyLockedNative",
            "docs": [
              "Amount in locked when the lockup began, in native currency.",
              "",
              "Note that this is not adjusted for withdraws. It is possible for this",
              "value to be bigger than amount_deposited_native after some vesting",
              "and withdrawals.",
              "",
              "This value is needed to compute the amount that vests each peroid,",
              "which should not change due to withdraws."
            ],
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "u8"
          },
          {
            "name": "reserved1",
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          },
          {
            "name": "reserved2",
            "type": {
              "array": [
                "u64",
                4
              ]
            }
          }
        ]
      }
    },
    {
      "name": "Lockup",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "kind",
            "docs": [
              "Type of lockup."
            ],
            "type": {
              "defined": "LockupKind"
            }
          },
          {
            "name": "startTs",
            "docs": [
              "Start of the lockup.",
              "",
              "Note, that if start_ts is in the future, the funds are nevertheless",
              "locked up!",
              "",
              "Similarly vote power computations don't care about start_ts and always",
              "assume the full interval from now to end_ts."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "LockupKind",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "duration",
            "type": {
              "defined": "LockupTimeDuration"
            }
          },
          {
            "name": "kind",
            "type": {
              "defined": "LockupKindKind"
            }
          },
          {
            "name": "filler",
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          }
        ]
      }
    },
    {
      "name": "LockupTimeDuration",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "periods",
            "type": "u64"
          },
          {
            "name": "unit",
            "type": {
              "defined": "LockupTimeUnit"
            }
          },
          {
            "name": "filler",
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          }
        ]
      }
    },
    {
      "name": "VotingConfig",
      "docs": [
        "Exchange rate for an asset that can be used to mint voting rights.",
        "",
        "See documentation of configure_voting_mint for details on how",
        "native token amounts convert to vote weight."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "baselineVoteWeightScaledFactor",
            "docs": [
              "Vote weight factor for all funds in the account, no matter if locked or not.",
              "",
              "In 1/SCALED_FACTOR_BASE units."
            ],
            "type": "u64"
          },
          {
            "name": "maxExtraLockupVoteWeightScaledFactor",
            "docs": [
              "Maximum extra vote weight factor for lockups.",
              "",
              "This is the extra votes gained for lockups lasting lockup_saturation_secs or",
              "longer. Shorter lockups receive only a fraction of the maximum extra vote weight,",
              "based on lockup_time divided by lockup_saturation_secs.",
              "",
              "In 1/SCALED_FACTOR_BASE units."
            ],
            "type": "u64"
          },
          {
            "name": "lockupSaturationSecs",
            "docs": [
              "Number of seconds of lockup needed to reach the maximum lockup bonus."
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "DepositConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ordinaryDepositMinLockupDuration",
            "docs": [
              "The minimal lock up duration for ordinary deposit."
            ],
            "type": {
              "defined": "LockupTimeDuration"
            }
          },
          {
            "name": "nodeDepositLockupDuration",
            "docs": [
              "The lock up duration for node deposit."
            ],
            "type": {
              "defined": "LockupTimeDuration"
            }
          },
          {
            "name": "nodeSecurityDeposit",
            "docs": [
              "Specific amount for node deposit."
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "ThresholdType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Percent"
          },
          {
            "name": "Absolute"
          }
        ]
      }
    },
    {
      "name": "LockupKindKind",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Daily"
          },
          {
            "name": "Monthly"
          },
          {
            "name": "Constant"
          }
        ]
      }
    },
    {
      "name": "LockupTimeUnit",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Day"
          },
          {
            "name": "Month"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "NodeDepositEvent",
      "fields": [
        {
          "name": "voter",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "lockup",
          "type": {
            "defined": "Lockup"
          },
          "index": false
        }
      ]
    },
    {
      "name": "NodeReleaseDepositEvent",
      "fields": [
        {
          "name": "voter",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "targetDepositEntryIndex",
          "type": "u8",
          "index": false
        }
      ]
    },
    {
      "name": "OrdinaryDepositEvent",
      "fields": [
        {
          "name": "voter",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "depositEntryIndex",
          "type": "u8",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "lockup",
          "type": {
            "defined": "Lockup"
          },
          "index": false
        }
      ]
    },
    {
      "name": "OrdinaryReleaseDepositEvent",
      "fields": [
        {
          "name": "voter",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "depositEntryIndex",
          "type": "u8",
          "index": false
        },
        {
          "name": "targetDepositEntryIndex",
          "type": "u8",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "WithdrawEvent",
      "fields": [
        {
          "name": "voter",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "depositEntryIndex",
          "type": "u8",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "ClaimRewardEvent",
      "fields": [
        {
          "name": "voter",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "VoterInfo",
      "fields": [
        {
          "name": "votingPower",
          "type": "u64",
          "index": false
        },
        {
          "name": "votingPowerBaseline",
          "type": "u64",
          "index": false
        },
        {
          "name": "rewardAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "depositEntries",
          "type": {
            "array": [
              {
                "option": {
                  "defined": "DepositEntryInfo"
                }
              },
              10
            ]
          },
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidGoverningMint",
      "msg": ""
    },
    {
      "code": 6001,
      "name": "GoverningTokenNonZero",
      "msg": ""
    },
    {
      "code": 6002,
      "name": "OutOfBoundsDepositEntryIndex",
      "msg": ""
    },
    {
      "code": 6003,
      "name": "InsufficientUnlockedTokens",
      "msg": ""
    },
    {
      "code": 6004,
      "name": "InvalidLockupPeriod",
      "msg": ""
    },
    {
      "code": 6005,
      "name": "DebugInstruction",
      "msg": ""
    },
    {
      "code": 6006,
      "name": "InvalidAuthority",
      "msg": ""
    },
    {
      "code": 6007,
      "name": "InvalidTokenOwnerRecord",
      "msg": ""
    },
    {
      "code": 6008,
      "name": "InvalidRealmAuthority",
      "msg": ""
    },
    {
      "code": 6009,
      "name": "VoterWeightOverflow",
      "msg": ""
    },
    {
      "code": 6010,
      "name": "LockupSaturationMustBePositive",
      "msg": ""
    },
    {
      "code": 6011,
      "name": "InternalProgramError",
      "msg": ""
    },
    {
      "code": 6012,
      "name": "InsufficientLockedTokens",
      "msg": ""
    },
    {
      "code": 6013,
      "name": "InternalErrorBadLockupVoteWeight",
      "msg": ""
    },
    {
      "code": 6014,
      "name": "DepositStartTooFarInFuture",
      "msg": ""
    },
    {
      "code": 6015,
      "name": "VaultTokenNonZero",
      "msg": ""
    },
    {
      "code": 6016,
      "name": "NodeDepositReservedEntryIndex",
      "msg": ""
    },
    {
      "code": 6017,
      "name": "InactiveDepositEntry",
      "msg": ""
    },
    {
      "code": 6018,
      "name": "NotOrdinaryDepositEntry",
      "msg": ""
    },
    {
      "code": 6019,
      "name": "CanNotShortenLockupDuration",
      "msg": ""
    },
    {
      "code": 6020,
      "name": "NodeDepositUnreleasableAtPresent",
      "msg": ""
    },
    {
      "code": 6021,
      "name": "ZeroAmount",
      "msg": ""
    },
    {
      "code": 6022,
      "name": "NodeSecurityDepositMustBePositive",
      "msg": ""
    },
    {
      "code": 6023,
      "name": "DuplicateNodeDeposit",
      "msg": ""
    },
    {
      "code": 6024,
      "name": "ActiveDepositEntryIndex",
      "msg": ""
    },
    {
      "code": 6025,
      "name": "InvalidLockupDuration",
      "msg": ""
    },
    {
      "code": 6026,
      "name": "InsufficientClaimableRewards",
      "msg": ""
    }
  ]
};

export const IDL: VoterStakeRegistry = {
  "version": "0.1.0",
  "name": "voter_stake_registry",
  "docs": [
    "# Introduction",
    "",
    "The governance registry is an \"addin\" to the SPL governance program that",
    "allows one to both vote with many different ypes of tokens for voting and to",
    "scale voting power as a linear function of time locked--subject to some",
    "maximum upper bound.",
    "",
    "The flow for voting with this program is as follows:",
    "",
    "- Create a SPL governance realm.",
    "- Create a governance registry account.",
    "- Add exchange rates for any tokens one wants to deposit. For example,",
    "if one wants to vote with tokens A and B, where token B has twice the",
    "voting power of token A, then the exchange rate of B would be 2 and the",
    "exchange rate of A would be 1.",
    "- Create a voter account.",
    "- Deposit tokens into this program, with an optional lockup period.",
    "- Vote.",
    "",
    "Upon voting with SPL governance, a client is expected to call",
    "`decay_voting_power` to get an up to date measurement of a given `Voter`'s",
    "voting power for the given slot. If this is not done, then the transaction",
    "will fail (since the SPL governance program will require the measurement",
    "to be active for the current slot).",
    "",
    "# Interacting with SPL Governance",
    "",
    "This program does not directly interact with SPL governance via CPI.",
    "Instead, it simply writes a `VoterWeightRecord` account with a well defined",
    "format, which is then used by SPL governance as the voting power measurement",
    "for a given user.",
    "",
    "# Max Vote Weight",
    "",
    "Given that one can use multiple tokens to vote, the max vote weight needs",
    "to be a function of the total supply of all tokens, converted into a common",
    "currency. For example, if you have Token A and Token B, where 1 Token B =",
    "10 Token A, then the `max_vote_weight` should be `supply(A) + supply(B)*10`",
    "where both are converted into common decimals. Then, when calculating the",
    "weight of an individual voter, one can convert B into A via the given",
    "exchange rate, which must be fixed.",
    "",
    "Note that the above also implies that the `max_vote_weight` must fit into",
    "a u64."
  ],
  "instructions": [
    {
      "name": "createRegistrar",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The voting registrar. There can only be a single registrar",
            "per governance realm and governing mint."
          ]
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "circuitBreaker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "maxVoterWeightRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "An spl-governance realm",
            "",
            "realm is validated in the instruction:",
            "- realm is owned by the governance_program_id",
            "- realm_governing_token_mint must be the community or council mint",
            "- realm_authority is realm.authority"
          ]
        },
        {
          "name": "governanceProgramId",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The program id of the spl-governance program the realm belongs to."
          ]
        },
        {
          "name": "realmGoverningTokenMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Either the realm community mint or the council mint."
          ]
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "circuitBreakerProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "registrarBump",
          "type": "u8"
        },
        {
          "name": "maxVoterWeightRecordBump",
          "type": "u8"
        },
        {
          "name": "votingConfig",
          "type": {
            "defined": "VotingConfig"
          }
        },
        {
          "name": "depositConfig",
          "type": {
            "defined": "DepositConfig"
          }
        },
        {
          "name": "circuitBreakerConfig",
          "type": {
            "defined": "WindowedCircuitBreakerConfigV0"
          }
        }
      ]
    },
    {
      "name": "createVoter",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "The authority controling the voter. Must be the same as the",
            "`governing_token_owner` in the token owner record used with",
            "spl-governance."
          ]
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterWeightRecord",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The voter weight record is the account that will be shown to spl-governance",
            "to prove how much vote weight the voter has. See update_voter_weight_record."
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "voterBump",
          "type": "u8"
        },
        {
          "name": "voterWeightRecordBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "nodeDeposit",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "nodeReleaseDeposit",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "targetDepositEntryIndex",
          "type": "u8"
        }
      ]
    },
    {
      "name": "ordinaryDeposit",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "depositEntryIndex",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "duration",
          "type": {
            "defined": "LockupTimeDuration"
          }
        }
      ]
    },
    {
      "name": "ordinaryReleaseDeposit",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "depositEntryIndex",
          "type": "u8"
        },
        {
          "name": "targetDepositEntryIndex",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateVoterWeightRecord",
      "accounts": [
        {
          "name": "registrar",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voterWeightRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateMaxVoteWeight",
      "accounts": [
        {
          "name": "registrar",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governingTokenMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Registrar.realm_governing_token_mint"
          ]
        },
        {
          "name": "maxVoterWeightRecord",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeVoter",
      "accounts": [
        {
          "name": "registrar",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "solDestination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setTimeOffset",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "timeOffset",
          "type": "i64"
        }
      ]
    },
    {
      "name": "updateDepositConfig",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "depositConfig",
          "type": {
            "defined": "DepositConfig"
          }
        }
      ]
    },
    {
      "name": "updateVotingConfig",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "votingConfig",
          "type": {
            "defined": "VotingConfig"
          }
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenOwnerRecord",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The token_owner_record for the voter_authority. This is needed",
            "to be able to forbid withdraws while the voter is engaged with",
            "a vote or has an open proposal.",
            "",
            "token_owner_record is validated in the instruction:",
            "- owned by registrar.governance_program_id",
            "- for the registrar.realm",
            "- for the registrar.realm_governing_token_mint",
            "- governing_token_owner is voter_authority"
          ]
        },
        {
          "name": "voterWeightRecord",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Withdraws must update the voter weight record, to prevent a stale",
            "record being used to vote after the withdraw."
          ]
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "depositEntryIndex",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimReward",
      "accounts": [
        {
          "name": "registrar",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "circuitBreaker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "circuitBreakerProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "logVoterInfo",
      "accounts": [
        {
          "name": "registrar",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "registrar",
      "docs": [
        "Instance of a voting rights distributor."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "governanceProgramId",
            "type": "publicKey"
          },
          {
            "name": "realm",
            "type": "publicKey"
          },
          {
            "name": "realmAuthority",
            "type": "publicKey"
          },
          {
            "name": "governingTokenMint",
            "type": "publicKey"
          },
          {
            "name": "votingConfig",
            "docs": [
              "Storage for voting configuration: voting_config + reserved1."
            ],
            "type": {
              "defined": "VotingConfig"
            }
          },
          {
            "name": "reserved1",
            "type": {
              "array": [
                "u64",
                5
              ]
            }
          },
          {
            "name": "depositConfig",
            "docs": [
              "Storage for deposit configuration: deposit_config + reserved2."
            ],
            "type": {
              "defined": "DepositConfig"
            }
          },
          {
            "name": "reserved2",
            "type": {
              "array": [
                "u64",
                5
              ]
            }
          },
          {
            "name": "currentRewardAmountPerSecond",
            "type": "u128"
          },
          {
            "name": "lastRewardAmountPerSecondRotatedTs",
            "docs": [
              "The last time 'current_reward_amount_per_second' was rotated."
            ],
            "type": "i64"
          },
          {
            "name": "rewardAccrualTs",
            "docs": [
              "The timestamp that rewards was last accrued at"
            ],
            "type": "i64"
          },
          {
            "name": "rewardIndex",
            "docs": [
              "Accumulator of the total earned rewards rate since the opening"
            ],
            "type": "u128"
          },
          {
            "name": "issuedRewardAmount",
            "docs": [
              "Amount of rewards that were issued."
            ],
            "type": "u64"
          },
          {
            "name": "permanentlyLockedAmount",
            "docs": [
              "Total permanently locked amount.",
              "Depositions with lockup kind 'Constant' are considered permanently locked"
            ],
            "type": "u64"
          },
          {
            "name": "timeOffset",
            "docs": [
              "Debug only: time offset, to allow tests to move forward in time."
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "maxVoterWeightRecordBump",
            "type": "u8"
          },
          {
            "name": "reserved3",
            "type": {
              "array": [
                "u8",
                14
              ]
            }
          },
          {
            "name": "reserved4",
            "type": {
              "array": [
                "u64",
                9
              ]
            }
          }
        ]
      }
    },
    {
      "name": "voter",
      "docs": [
        "User account for minting voting rights."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "voterAuthority",
            "type": "publicKey"
          },
          {
            "name": "registrar",
            "type": "publicKey"
          },
          {
            "name": "deposits",
            "type": {
              "array": [
                {
                  "defined": "DepositEntry"
                },
                16
              ]
            }
          },
          {
            "name": "rewardIndex",
            "docs": [
              "Global reward_index as of the most recent balance-changing action"
            ],
            "type": "u128"
          },
          {
            "name": "rewardClaimableAmount",
            "docs": [
              "Rewards amount available for claim"
            ],
            "type": "u64"
          },
          {
            "name": "voterBump",
            "type": "u8"
          },
          {
            "name": "voterWeightRecordBump",
            "type": "u8"
          },
          {
            "name": "reserved1",
            "type": {
              "array": [
                "u8",
                6
              ]
            }
          },
          {
            "name": "reserved2",
            "type": {
              "array": [
                "u64",
                8
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "WindowedCircuitBreakerConfigV0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "windowSizeSeconds",
            "type": "u64"
          },
          {
            "name": "thresholdType",
            "type": {
              "defined": "ThresholdType"
            }
          },
          {
            "name": "threshold",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "DepositEntryInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lockup",
            "docs": [
              "The lockup info"
            ],
            "type": {
              "defined": "Lockup"
            }
          },
          {
            "name": "amountLocked",
            "docs": [
              "Amount that is locked"
            ],
            "type": "u64"
          },
          {
            "name": "amountUnlocked",
            "docs": [
              "Amount that is unlocked"
            ],
            "type": "u64"
          },
          {
            "name": "votingPower",
            "docs": [
              "Voting power implied by this deposit entry"
            ],
            "type": "u64"
          },
          {
            "name": "votingPowerBaseline",
            "docs": [
              "Voting power without any adjustments for lockup"
            ],
            "type": "u64"
          },
          {
            "name": "vesting",
            "docs": [
              "Information about vesting, if any"
            ],
            "type": {
              "option": {
                "defined": "VestingInfo"
              }
            }
          }
        ]
      }
    },
    {
      "name": "VestingInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rate",
            "docs": [
              "Amount of tokens vested each period"
            ],
            "type": "u64"
          },
          {
            "name": "nextTimestamp",
            "docs": [
              "Time of the next upcoming vesting"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "DepositEntry",
      "docs": [
        "Bookkeeping for a single deposit for a given mint and lockup schedule."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lockup",
            "type": {
              "defined": "Lockup"
            }
          },
          {
            "name": "amountDepositedNative",
            "docs": [
              "Amount in deposited, in native currency. Withdraws of vested tokens",
              "directly reduce this amount.",
              "",
              "This directly tracks the total amount added by the user. They may",
              "never withdraw more than this amount."
            ],
            "type": "u64"
          },
          {
            "name": "amountInitiallyLockedNative",
            "docs": [
              "Amount in locked when the lockup began, in native currency.",
              "",
              "Note that this is not adjusted for withdraws. It is possible for this",
              "value to be bigger than amount_deposited_native after some vesting",
              "and withdrawals.",
              "",
              "This value is needed to compute the amount that vests each peroid,",
              "which should not change due to withdraws."
            ],
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "u8"
          },
          {
            "name": "reserved1",
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          },
          {
            "name": "reserved2",
            "type": {
              "array": [
                "u64",
                4
              ]
            }
          }
        ]
      }
    },
    {
      "name": "Lockup",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "kind",
            "docs": [
              "Type of lockup."
            ],
            "type": {
              "defined": "LockupKind"
            }
          },
          {
            "name": "startTs",
            "docs": [
              "Start of the lockup.",
              "",
              "Note, that if start_ts is in the future, the funds are nevertheless",
              "locked up!",
              "",
              "Similarly vote power computations don't care about start_ts and always",
              "assume the full interval from now to end_ts."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "LockupKind",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "duration",
            "type": {
              "defined": "LockupTimeDuration"
            }
          },
          {
            "name": "kind",
            "type": {
              "defined": "LockupKindKind"
            }
          },
          {
            "name": "filler",
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          }
        ]
      }
    },
    {
      "name": "LockupTimeDuration",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "periods",
            "type": "u64"
          },
          {
            "name": "unit",
            "type": {
              "defined": "LockupTimeUnit"
            }
          },
          {
            "name": "filler",
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          }
        ]
      }
    },
    {
      "name": "VotingConfig",
      "docs": [
        "Exchange rate for an asset that can be used to mint voting rights.",
        "",
        "See documentation of configure_voting_mint for details on how",
        "native token amounts convert to vote weight."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "baselineVoteWeightScaledFactor",
            "docs": [
              "Vote weight factor for all funds in the account, no matter if locked or not.",
              "",
              "In 1/SCALED_FACTOR_BASE units."
            ],
            "type": "u64"
          },
          {
            "name": "maxExtraLockupVoteWeightScaledFactor",
            "docs": [
              "Maximum extra vote weight factor for lockups.",
              "",
              "This is the extra votes gained for lockups lasting lockup_saturation_secs or",
              "longer. Shorter lockups receive only a fraction of the maximum extra vote weight,",
              "based on lockup_time divided by lockup_saturation_secs.",
              "",
              "In 1/SCALED_FACTOR_BASE units."
            ],
            "type": "u64"
          },
          {
            "name": "lockupSaturationSecs",
            "docs": [
              "Number of seconds of lockup needed to reach the maximum lockup bonus."
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "DepositConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ordinaryDepositMinLockupDuration",
            "docs": [
              "The minimal lock up duration for ordinary deposit."
            ],
            "type": {
              "defined": "LockupTimeDuration"
            }
          },
          {
            "name": "nodeDepositLockupDuration",
            "docs": [
              "The lock up duration for node deposit."
            ],
            "type": {
              "defined": "LockupTimeDuration"
            }
          },
          {
            "name": "nodeSecurityDeposit",
            "docs": [
              "Specific amount for node deposit."
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "ThresholdType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Percent"
          },
          {
            "name": "Absolute"
          }
        ]
      }
    },
    {
      "name": "LockupKindKind",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Daily"
          },
          {
            "name": "Monthly"
          },
          {
            "name": "Constant"
          }
        ]
      }
    },
    {
      "name": "LockupTimeUnit",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Day"
          },
          {
            "name": "Month"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "NodeDepositEvent",
      "fields": [
        {
          "name": "voter",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "lockup",
          "type": {
            "defined": "Lockup"
          },
          "index": false
        }
      ]
    },
    {
      "name": "NodeReleaseDepositEvent",
      "fields": [
        {
          "name": "voter",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "targetDepositEntryIndex",
          "type": "u8",
          "index": false
        }
      ]
    },
    {
      "name": "OrdinaryDepositEvent",
      "fields": [
        {
          "name": "voter",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "depositEntryIndex",
          "type": "u8",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "lockup",
          "type": {
            "defined": "Lockup"
          },
          "index": false
        }
      ]
    },
    {
      "name": "OrdinaryReleaseDepositEvent",
      "fields": [
        {
          "name": "voter",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "depositEntryIndex",
          "type": "u8",
          "index": false
        },
        {
          "name": "targetDepositEntryIndex",
          "type": "u8",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "WithdrawEvent",
      "fields": [
        {
          "name": "voter",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "depositEntryIndex",
          "type": "u8",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "ClaimRewardEvent",
      "fields": [
        {
          "name": "voter",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "VoterInfo",
      "fields": [
        {
          "name": "votingPower",
          "type": "u64",
          "index": false
        },
        {
          "name": "votingPowerBaseline",
          "type": "u64",
          "index": false
        },
        {
          "name": "rewardAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "depositEntries",
          "type": {
            "array": [
              {
                "option": {
                  "defined": "DepositEntryInfo"
                }
              },
              10
            ]
          },
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidGoverningMint",
      "msg": ""
    },
    {
      "code": 6001,
      "name": "GoverningTokenNonZero",
      "msg": ""
    },
    {
      "code": 6002,
      "name": "OutOfBoundsDepositEntryIndex",
      "msg": ""
    },
    {
      "code": 6003,
      "name": "InsufficientUnlockedTokens",
      "msg": ""
    },
    {
      "code": 6004,
      "name": "InvalidLockupPeriod",
      "msg": ""
    },
    {
      "code": 6005,
      "name": "DebugInstruction",
      "msg": ""
    },
    {
      "code": 6006,
      "name": "InvalidAuthority",
      "msg": ""
    },
    {
      "code": 6007,
      "name": "InvalidTokenOwnerRecord",
      "msg": ""
    },
    {
      "code": 6008,
      "name": "InvalidRealmAuthority",
      "msg": ""
    },
    {
      "code": 6009,
      "name": "VoterWeightOverflow",
      "msg": ""
    },
    {
      "code": 6010,
      "name": "LockupSaturationMustBePositive",
      "msg": ""
    },
    {
      "code": 6011,
      "name": "InternalProgramError",
      "msg": ""
    },
    {
      "code": 6012,
      "name": "InsufficientLockedTokens",
      "msg": ""
    },
    {
      "code": 6013,
      "name": "InternalErrorBadLockupVoteWeight",
      "msg": ""
    },
    {
      "code": 6014,
      "name": "DepositStartTooFarInFuture",
      "msg": ""
    },
    {
      "code": 6015,
      "name": "VaultTokenNonZero",
      "msg": ""
    },
    {
      "code": 6016,
      "name": "NodeDepositReservedEntryIndex",
      "msg": ""
    },
    {
      "code": 6017,
      "name": "InactiveDepositEntry",
      "msg": ""
    },
    {
      "code": 6018,
      "name": "NotOrdinaryDepositEntry",
      "msg": ""
    },
    {
      "code": 6019,
      "name": "CanNotShortenLockupDuration",
      "msg": ""
    },
    {
      "code": 6020,
      "name": "NodeDepositUnreleasableAtPresent",
      "msg": ""
    },
    {
      "code": 6021,
      "name": "ZeroAmount",
      "msg": ""
    },
    {
      "code": 6022,
      "name": "NodeSecurityDepositMustBePositive",
      "msg": ""
    },
    {
      "code": 6023,
      "name": "DuplicateNodeDeposit",
      "msg": ""
    },
    {
      "code": 6024,
      "name": "ActiveDepositEntryIndex",
      "msg": ""
    },
    {
      "code": 6025,
      "name": "InvalidLockupDuration",
      "msg": ""
    },
    {
      "code": 6026,
      "name": "InsufficientClaimableRewards",
      "msg": ""
    }
  ]
};
