export const getUengageData = async (storeId) => {
  
  let UENGAGE_ACCESS_TOKEN;
  let UENGAGE_STORE_ID;
  
  if (storeId === "225") {
      UENGAGE_ACCESS_TOKEN = "35AO5X9MS18FL"
      UENGAGE_STORE_ID = "49405"
    } else if (storeId === "28450") {
      UENGAGE_ACCESS_TOKEN = "LOVB3VNLKL5FI"
      UENGAGE_STORE_ID = "49394"
    } else if (storeId === "11526") {
      UENGAGE_ACCESS_TOKEN = "V5DX4CO0Y6V00"
      UENGAGE_STORE_ID = "49395"
    } else if (storeId === "26311") {
      UENGAGE_ACCESS_TOKEN = "VOPCEQCMA06UJ"
      UENGAGE_STORE_ID = "49397"
    } else if (storeId === "314") {
      UENGAGE_ACCESS_TOKEN = "4RG22X0TPP9TQ"
      UENGAGE_STORE_ID = "49398"
      
    } else if (storeId === "312") {
      UENGAGE_ACCESS_TOKEN = "IRV76G3IMOLJK"
      UENGAGE_STORE_ID = "49399"
      
    } else if (storeId === "28451") {
      UENGAGE_ACCESS_TOKEN = "LJJTTX90O7M8B"
      UENGAGE_STORE_ID = "49400"
      
    } else if (storeId === "26867") {
      UENGAGE_ACCESS_TOKEN = "FTI9ZJHMID5RX"
      UENGAGE_STORE_ID = "49401"
      
    } else if (storeId === "26314") {
      UENGAGE_ACCESS_TOKEN = "60MYPVZTUZKVJ"
      UENGAGE_STORE_ID = "49402"
      
    } else if (storeId === "311") {
      UENGAGE_ACCESS_TOKEN = "O647A607A5TYA"
      UENGAGE_STORE_ID = "49403"
      
    } else if (storeId === "11527") {
      UENGAGE_ACCESS_TOKEN = "8D3M14RMYTAIL"
      UENGAGE_STORE_ID = "49404"
      
    } else if (storeId === "56965") {
      UENGAGE_ACCESS_TOKEN = "91VEDO0CP954S"
      UENGAGE_STORE_ID = "49940"
      
    } else if (storeId === "56963") {
      UENGAGE_ACCESS_TOKEN = "9KBLWNFQ0QQW1"
      UENGAGE_STORE_ID = "49941"
      
    } else if (storeId === "57637") {
      UENGAGE_ACCESS_TOKEN = "P7D8P2RLA25Q1"
      UENGAGE_STORE_ID = "52402"
      
    } else if (storeId === "57636") {
      UENGAGE_ACCESS_TOKEN = "CWXO07KYI1I8E"
      UENGAGE_STORE_ID = "54233"
      
    }

  return {
    UENGAGE_ACCESS_TOKEN,
    UENGAGE_STORE_ID
  }
}