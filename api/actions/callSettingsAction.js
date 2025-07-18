import { CallSettingActionGlobalActionContext } from "gadget-server";

/**
 * Main function to execute the initialization of Khagati settings.
 * 
 * @param {CallSettingActionGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @returns {Promise<void>} A promise that resolves when the settings have been initialized.
 */
export async function run({ params, logger, api, connections }) {
  try {
    // Create setting groups
    const khagatiSettingGroupRecord1 = await api.khagatiSettingGroup.create({
      GID: 11,
      description: { markdown: "General Settings of Khagati" },
      title: "General",
    });

    const khagatiSettingGroupRecord2 = await api.khagatiSettingGroup.create({
      GID: 12,
      description: { markdown: "Custom extension of Khagati" },
      title: "Plugins",
    });

    const khagatiSettingGroupRecord3 = await api.khagatiSettingGroup.create({
      GID: 13,
      description: { markdown: "Information about the company" },
      title: "Company Details",
    });

    const khagatiSettingGroupRecord4 = await api.khagatiSettingGroup.create({
      GID: 14,
      description: { markdown: "API keys required for the operation of different sales channels and inventory" },
      title: "API Integration",
    });

    // Create settings under "General" group
    await api.khagatiSetting.create({
      title: "Store Coverage Type",
      type: "select",
      GID: 11,
      value: "radius",
      description: { markdown: "Type of coverage" },
      options: {
        selectOptions: [
          { label: "Radius", value: "radius" },
          { label: "Pincode", value: "pincode" },
          { label: "Nearest Store", value: "nearest_store" },
          { label: "Highest Inventory", value: "highest_inventory" },
        ],
      },
    });

    await api.khagatiSetting.create({
      title: "Inventory Mode",
      type: "select",
      GID: 11,
      value: "Primary-with-backup",
      description: { markdown: "Inventory selection and calculation" },
      options: {
        selectOptions: [
          { label: "Cluster", value: "cluster" },
          { label: "Primary With Backup", value: "primary_with_backup" },
          { label: "Primary", value: "primary" },
        ],
      },
    });

    await api.khagatiSetting.create({
      title: "Radius Selection",
      type: "select",
      GID: 11,
      value: "5",
      description: { markdown: "Selected number of radius" },
      options: {
        selectOptions: [
          { label: "1", value: "1" },
          { label: "2", value: "2" },
          { label: "3", value: "3" },
          { label: "4", value: "4" },
          { label: "5", value: "5" },
        ],
      },
    });

    // Create settings under "Plugins" group
    await api.khagatiSetting.create({
      title: "Plugins Title",
      type: "text",
      GID: 12,
      value: "Plugins title value",
      description: { markdown: "Description about plugins title" },
    });

    // Create settings under "Company Details" group
    await api.khagatiSetting.create({
      title: "Company Name",
      type: "text",
      GID: 13,
      value: "Company Name",
      description: { markdown: "" },
    });

    await api.khagatiSetting.create({
      title: "Phone number",
      type: "text",
      GID: 13,
      value: "9888777766",
      description: { markdown: "" },
    });

    await api.khagatiSetting.create({
      title: "GST",
      type: "text",
      GID: 13,
      value: "xxxxxxxxxxxx",
      description: { markdown: "" },
    });

    await api.khagatiSetting.create({
      title: "Email",
      type: "text",
      GID: 13,
      value: "example@gmail.com",
      description: { markdown: "" },
    });

    await api.khagatiSetting.create({
      title: "Email Auth Token",
      type: "text",
      GID: 13,
      value: "xxxxxxxxxxxx",
      description: { markdown: "Auth token for Email API" },
    });

    // Create settings under "API Integration" group
    await api.khagatiSetting.create({
      title: "Shipping API",
      type: "text",
      GID: 14,
      value: "xxxxxxxxxxxx",
      description: { markdown: "" },
    });

    await api.khagatiSetting.create({
      title: "Shipping API Token",
      type: "text",
      GID: 14,
      value: "xxxxxxxxxxxx",
      description: { markdown: "Auth token for shipping API" },
    });

    await api.khagatiSetting.create({
      title: "ERP API",
      type: "text",
      GID: 14,
      value: "xxxxxxxxxxxx",
      description: { markdown: "API for ERP Sync" },
    });

    await api.khagatiSetting.create({
      title: "ERP Auth Token",
      type: "text",
      GID: 14,
      value: "xxxxxxxxxxxx",
      description: { markdown: "Auth token for ERP" },
    });

    await api.khagatiSetting.create({
      title: "SMS API",
      type: "text",
      GID: 14,
      value: "xxxxxxxxxxxx",
      description: { markdown: "API for SMS" },
    });

    await api.khagatiSetting.create({
      title: "SMS Auth Token",
      type: "text",
      GID: 14,
      value: "xxxxxxxxxxxx",
      description: { markdown: "Auth Token for SMS API" },
    });

    await api.khagatiSetting.create({
      title: "Email API",
      type: "text",
      GID: 14,
      value: "xxxxxxxxxxxx",
      description: { markdown: "API for Email" },
    });

    await api.khagatiSetting.create({
      title: "Whatsapp API",
      type: "text",
      GID: 14,
      value: "xxxxxxxxxxxx",
      description: { markdown: "API for WhatsApp" },
    });

    await api.khagatiSetting.create({
      title: "Whatsapp Auth Token",
      type: "text",
      GID: 14,
      value: "xxxxxxxxxxxx",
      description: { markdown: "Auth Token for WhatsApp" },
    });

    logger.info("Khagati settings and groups initialized successfully.");
  } catch (error) {
    logger.error(`Error initializing Khagati settings: ${error.message}`);
  }
}