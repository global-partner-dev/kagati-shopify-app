// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 * @typedef {import("../generated/api").Operation} Operation
 */
/**
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  // Parse configuration from metafield
  /**
   * @type {{
   *  stateProvinceCode: string,
   *  message: string,
   *  title: string,
   *  pincodeZone: string,
   *  id: string,
   *  description: string
   * }}
   */
  const configuration = JSON.parse(
    input?.deliveryCustomization?.metafield?.value ?? "{}"
  );

  // if (!configuration.message) {
  //   return NO_CHANGES;
  // }

  const { stateProvinceCode, message, title, pincodeZone, id } = configuration;
  console.log(stateProvinceCode);
  console.log("123");
  const storeDistance = parseFloat(input.cart.storeDistance?.value || "0");

  const deliveryConfigurations = [
    {
      "Min Price (Rs.)": 0.0,
      "Max Price (Rs.)": 899.0,
      "Min Distance (km)": 0.0,
      "Max Distance (km)": 3.0,
      "AOV": "< 899 Rs.",
      "Delivery Price (Rs.)": 69,
      "Pick up point": "Store",
      "Delivery type": "Express delivery",
      "Min Time (min)": 0,
      "Max Time (min)": 90.0
    },
    {
      "Min Price (Rs.)": 0.0,
      "Max Price (Rs.)": 899.0,
      "Min Distance (km)": 3.0,
      "Max Distance (km)": 5.0,
      "AOV": "< 899 Rs.",
      "Delivery Price (Rs.)": 89,
      "Pick up point": "Store",
      "Delivery type": "Express delivery",
      "Min Time (min)": 0,
      "Max Time (min)": 90.0
    },
    {
      "Min Price (Rs.)": 0.0,
      "Max Price (Rs.)": 899.0,
      "Min Distance (km)": 5.0,
      "Max Distance (km)": 7.0,
      "AOV": "< 899 Rs.",
      "Delivery Price (Rs.)": 119,
      "Pick up point": "Store",
      "Delivery type": "Express delivery",
      "Min Time (min)": 0,
      "Max Time (min)": 90.0
    },
    {
      "Min Price (Rs.)": 0.0,
      "Max Price (Rs.)": 899.0,
      "Min Distance (km)": 7.0,
      "Max Distance (km)": 10.0,
      "AOV": "< 899 Rs.",
      "Delivery Price (Rs.)": 149,
      "Pick up point": "Store",
      "Delivery type": "Expedited delivery",
      "Min Time (min)": 0,
      "Max Time (min)": 120.0
    },
    {
      "Min Price (Rs.)": 0.0,
      "Max Price (Rs.)": 899.0,
      "Min Distance (km)": 10.0,
      "Max Distance (km)": 15.0,
      "AOV": "< 899 Rs.",
      "Delivery Price (Rs.)": 229,
      "Pick up point": "Store",
      "Delivery type": "Expedited delivery",
      "Min Time (min)": 0,
      "Max Time (min)": 180.0
    },
    {
      "Min Price (Rs.)": 899.0,
      "Max Price (Rs.)": 1499.0,
      "Min Distance (km)": 0.0,
      "Max Distance (km)": 3.0,
      "AOV": ">= 899 < 1499 Rs.",
      "Delivery Price (Rs.)": 0,
      "Pick up point": "Store",
      "Delivery type": "Express delivery",
      "Min Time (min)": 0,
      "Max Time (min)": 90.0
    },
    {
      "Min Price (Rs.)": 899.0,
      "Max Price (Rs.)": 1499.0,
      "Min Distance (km)": 3.0,
      "Max Distance (km)": 5.0,
      "AOV": ">= 899 < 1499 Rs.",
      "Delivery Price (Rs.)": 39,
      "Pick up point": "Store",
      "Delivery type": "Express delivery",
      "Min Time (min)": 0,
      "Max Time (min)": 90.0
    },
    {
      "Min Price (Rs.)": 899.0,
      "Max Price (Rs.)": 1499.0,
      "Min Distance (km)": 5.0,
      "Max Distance (km)": 7.0,
      "AOV": ">= 899 < 1499 Rs.",
      "Delivery Price (Rs.)": 59,
      "Pick up point": "Store",
      "Delivery type": "Express delivery",
      "Min Time (min)": 0,
      "Max Time (min)": 90.0
    },
    {
      "Min Price (Rs.)": 899.0,
      "Max Price (Rs.)": 1499.0,
      "Min Distance (km)": 7.0,
      "Max Distance (km)": 10.0,
      "AOV": ">= 899 < 1499 Rs.",
      "Delivery Price (Rs.)": 99,
      "Pick up point": "Store",
      "Delivery type": "Expedited delivery",
      "Min Time (min)": 0,
      "Max Time (min)": 120.0
    },
    {
      "Min Price (Rs.)": 899.0,
      "Max Price (Rs.)": 1499.0,
      "Min Distance (km)": 10.0,
      "Max Distance (km)": 15.0,
      "AOV": ">= 899 < 1499 Rs.",
      "Delivery Price (Rs.)": 169,
      "Pick up point": "Store",
      "Delivery type": "Expedited delivery",
      "Min Time (min)": 0,
      "Max Time (min)": 180.0
    },
    {
      "Min Price (Rs.)": 1499.0,
      "Max Price (Rs.)": null,
      "Min Distance (km)": 0.0,
      "Max Distance (km)": 7.0,
      "AOV": ">= 1499",
      "Delivery Price (Rs.)": 0,
      "Pick up point": "Store",
      "Delivery type": "Express delivery",
      "Min Time (min)": 0,
      "Max Time (min)": 90.0
    },
    {
      "Min Price (Rs.)": 1499.0,
      "Max Price (Rs.)": null,
      "Min Distance (km)": 7.0,
      "Max Distance (km)": 10.0,
      "AOV": ">= 1499",
      "Delivery Price (Rs.)": 49,
      "Pick up point": "Store",
      "Delivery type": "Expedited delivery",
      "Min Time (min)": 0,
      "Max Time (min)": 120.0
    },
    {
      "Min Price (Rs.)": 1499.0,
      "Max Price (Rs.)": null,
      "Min Distance (km)": 10.0,
      "Max Distance (km)": 15.0,
      "AOV": ">= 1499",
      "Delivery Price (Rs.)": 99,
      "Pick up point": "Store",
      "Delivery type": "Expedited delivery",
      "Min Time (min)": 0,
      "Max Time (min)": 180.0
    },
    {
      "Min Price (Rs.)": 1499.0,
      "Max Price (Rs.)": null,
      "Min Distance (km)": 15.0,
      "Max Distance (km)": 30000,
      "AOV": ">= 1499",
      "Delivery Price (Rs.)": 149,
      "Pick up point": "Store",
      "Delivery type": "Standard delivery",
      "Min Time (min)": 0,
      "Max Time (min)": 180.0
    }
  ];

  let toRename = [];
  let toHide = [];
  let standardOptions = [];

  // Get the current time and check if it falls within the specified time frame (9 PM to 8 AM)
  const isNightTime = (input.cart.hours && parseInt(input.cart.hours) >= 20 &&  parseInt(input.cart.hours) <= 23);
  const isEarlyMorning = (input.cart.hours &&  parseInt(input.cart.hours) >= 0 &&  parseInt(input.cart.hours) <= 8 );
  console.log('now',isNightTime,isEarlyMorning)
  

  if (storeDistance > 0) {
    input.cart.deliveryGroups.forEach(group => {
      group.deliveryOptions.forEach(option => {
        let minDistance = 0, maxDistance = Infinity;

        if (option?.description && option?.description.indexOf("Standard") < 0) {
          option.description.split(',').forEach(part => {
            const [key, value] = part.split('-');
            if (key.trim() === "Min") {
              minDistance = parseFloat(value.trim());
            } else if (key.trim() === "Max") {
              maxDistance = parseFloat(value.trim());
            }
          });

          if (storeDistance >= minDistance && storeDistance <= maxDistance) {
            const matchingConfig = deliveryConfigurations.find(config =>
              storeDistance >= config["Min Distance (km)"] && storeDistance <= config["Max Distance (km)"]
            );

            if (matchingConfig) {
              let estimatedTime = `${matchingConfig["Min Time (min)"]}-${matchingConfig["Max Time (min)"]} minutes`;

              if (isNightTime ) {
                toRename.push({
                  rename: {
                    deliveryOptionHandle: option.handle,
                    title: "Next day delivery",
                    
                  }
                });
              } else if(isEarlyMorning) {
                toRename.push({
                  rename: {
                    deliveryOptionHandle: option.handle,
                    title:"Same day delivery" ,
                    
                  }
                });
              }
              
            }
          } else {
            toHide.push({
              hide: {
                deliveryOptionHandle: option.handle
              }
            });
          }
        } else {
          standardOptions.push({
            hide: {
              deliveryOptionHandle: option.handle
            }
          });
        }
      });
    });
  } else {
    // Renaming logic based on configuration parameters when storeDistance is not present
    input.cart.deliveryGroups.forEach(group => {
      group.deliveryOptions.forEach(option => {
        const address = group.deliveryAddress;
        if ((address?.provinceCode && address.provinceCode === stateProvinceCode) ||
            (address?.zip && address.zip === pincodeZone)) {
          const renameOperation = { deliveryOptionHandle: option.handle };
          if (title && message) {
            renameOperation.title = `${title} - ${message}`;
          }
          toRename.push({ rename: renameOperation });
        }
      });
    });
  }

  // Final renaming application for all options, ensuring the config-based renaming is applied
  // toRename = toRename.map(op => {
  //   const option = input.cart.deliveryGroups.flatMap(group => group.deliveryOptions)
  //                   .find(opt => opt.handle === op.rename.deliveryOptionHandle);
  //   if (option) {
  //     return {
  //       rename: {
  //         deliveryOptionHandle: option.handle,
  //         title: `${title} - ${message}`,
  //         description: op.rename.description
  //       }
  //     };
  //   }
  //   return op;
  // });
  console.log("abc");

  if (Object.keys(toRename).length === 0 && Object.keys(toHide).length === 0) {
    return NO_CHANGES;
  }
  if (Object.keys(toRename).length > 0 ) {
    return {
      operations: [...toRename, ...toHide]
    };
  }else{
    return {
      operations: [...toRename, ...toHide,...standardOptions]
    };
  }

  return {
    operations: [...toRename, ...toHide]
  };
}
