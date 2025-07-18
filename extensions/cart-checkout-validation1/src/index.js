export * from './run';

// @ts-check

// Use JSDoc annotations for type safety
/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * The configured entrypoint for the 'purchase.validation.run' extension target
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
    if (input.buyerJourney.step === "CHECKOUT_INTERACTION") {

        // The error for order maximum
        const orderMaxError = {
            localizedMessage: "There is an order maximum of $1,000 for customers without established order history",
            target: ""
        };

        // The error for incorrect pincode
        const pincodeError = {
            localizedMessage: "The pincode is incorrect",
            target: "$.cart.deliveryGroups[0].deliveryAddress.zip"
        };

        const stateError = {
            localizedMessage: "you can't change stateName to this one",
            target: "$.cart.deliveryGroups[0].deliveryAddress.provinceCode"
        }

        // Parse the decimal (serialized as a string) into a float.
        const orderSubtotal = parseFloat(input.cart.cost.subtotalAmount.amount);
        const errors = [];

        // Log the input for debugging purposes
        console.log(input.buyerJourney, "buyerJourney");

        // Orders with subtotals greater than $1,000 are available only to established customers.
        // if (orderSubtotal > 1000.0) {
        //     // If the customer has ordered less than 5 times in the past,
        //     // then treat them as a new customer.
        //     const numberOfOrders = input.cart.buyerIdentity?.customer?.numberOfOrders ?? 0;

        //     if (numberOfOrders < 5) {
        //         errors.push(orderMaxError);
        //     }
        // }

        // Access the province code and ZIP code from the delivery address
        //const deliveryGroup = input.cart.deliveryGroups?.[0]
        const provinceCode = input.cart.deliveryGroups?.[0].deliveryAddress?.provinceCode;
        const shippingZip =  input.cart.deliveryGroups?.[0].deliveryAddress?.zip;

        // Log the province code and ZIP code for debugging purposes
        console.log("Province Code:", provinceCode);
        console.log("Shipping ZIP Code:", shippingZip);

        // Check if the province code is "HR" and if the shipping ZIP code is "123456"
        if (provinceCode === "HR") {

            if( shippingZip !== "123456"){
                errors.push(pincodeError)
            }

        }else{

            errors.push(stateError);
        }

        return { errors };
    }

    return null;
}
