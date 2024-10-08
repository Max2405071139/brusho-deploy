export type CircuitBreaker = {
  "version": "0.1.0",
  "name": "circuit_breaker",
  "instructions": [
    {
      "name": "initializeAccountWindowedBreakerV0",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "circuitBreaker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
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
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "InitializeAccountWindowedBreakerArgsV0"
          }
        }
      ]
    },
    {
      "name": "transferV0",
      "accounts": [
        {
          "name": "from",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "circuitBreaker",
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
          "name": "args",
          "type": {
            "defined": "TransferArgsV0"
          }
        }
      ]
    },
    {
      "name": "updateAccountWindowedBreakerV0",
      "accounts": [
        {
          "name": "circuitBreaker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "UpdateAccountWindowedBreakerArgsV0"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "accountWindowedCircuitBreakerV0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenAccount",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "config",
            "type": {
              "defined": "WindowedCircuitBreakerConfigV0"
            }
          },
          {
            "name": "lastWindow",
            "type": {
              "defined": "WindowV0"
            }
          },
          {
            "name": "bumpSeed",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "InitializeAccountWindowedBreakerArgsV0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "config",
            "type": {
              "defined": "WindowedCircuitBreakerConfigV0"
            }
          }
        ]
      }
    },
    {
      "name": "TransferArgsV0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "UpdateAccountWindowedBreakerArgsV0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newAuthority",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "config",
            "type": {
              "option": {
                "defined": "WindowedCircuitBreakerConfigV0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "WindowV0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lastAggregatedValue",
            "type": "u64"
          },
          {
            "name": "lastUnixTimestamp",
            "type": "i64"
          }
        ]
      }
    },
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
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "CircuitBreakerTriggered",
      "msg": "The circuit breaker was triggered"
    },
    {
      "code": 6001,
      "name": "ArithmeticError",
      "msg": "Error in arithmetic"
    },
    {
      "code": 6002,
      "name": "InvalidConfig",
      "msg": "Invalid config"
    }
  ]
};

export const IDL: CircuitBreaker = {
  "version": "0.1.0",
  "name": "circuit_breaker",
  "instructions": [
    {
      "name": "initializeAccountWindowedBreakerV0",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "circuitBreaker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
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
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "InitializeAccountWindowedBreakerArgsV0"
          }
        }
      ]
    },
    {
      "name": "transferV0",
      "accounts": [
        {
          "name": "from",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "circuitBreaker",
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
          "name": "args",
          "type": {
            "defined": "TransferArgsV0"
          }
        }
      ]
    },
    {
      "name": "updateAccountWindowedBreakerV0",
      "accounts": [
        {
          "name": "circuitBreaker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "UpdateAccountWindowedBreakerArgsV0"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "accountWindowedCircuitBreakerV0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenAccount",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "config",
            "type": {
              "defined": "WindowedCircuitBreakerConfigV0"
            }
          },
          {
            "name": "lastWindow",
            "type": {
              "defined": "WindowV0"
            }
          },
          {
            "name": "bumpSeed",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "InitializeAccountWindowedBreakerArgsV0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "config",
            "type": {
              "defined": "WindowedCircuitBreakerConfigV0"
            }
          }
        ]
      }
    },
    {
      "name": "TransferArgsV0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "UpdateAccountWindowedBreakerArgsV0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newAuthority",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "config",
            "type": {
              "option": {
                "defined": "WindowedCircuitBreakerConfigV0"
              }
            }
          }
        ]
      }
    },
    {
      "name": "WindowV0",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lastAggregatedValue",
            "type": "u64"
          },
          {
            "name": "lastUnixTimestamp",
            "type": "i64"
          }
        ]
      }
    },
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
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "CircuitBreakerTriggered",
      "msg": "The circuit breaker was triggered"
    },
    {
      "code": 6001,
      "name": "ArithmeticError",
      "msg": "Error in arithmetic"
    },
    {
      "code": 6002,
      "name": "InvalidConfig",
      "msg": "Invalid config"
    }
  ]
};
