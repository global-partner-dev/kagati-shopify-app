/**
 * ActionModalComponent
 * 
 * This component renders a modal using Shopify's Polaris library. The modal displays a title, primary and secondary buttons,
 * and any content passed as children. The component provides a flexible way to handle modal actions, ensuring that the modal
 * closes appropriately after the primary action is performed.
 * 
 * @param {string} modalTitle - The title displayed at the top of the modal.
 * @param {string} modalPrimaryButton - The label for the primary action button.
 * @param {string} [modalSecondaryButton] - The label for the secondary action button (defaults to "Cancel").
 * @param {boolean} modalActive - Boolean value indicating whether the modal is open or closed.
 * @param {function} handleModalClose - Function to be called when the modal needs to be closed.
 * @param {ReactNode} children - The content to be displayed within the modal's body.
 * @param {function} [onPrimaryAction] - Function to be executed when the primary action button is clicked.
 * 
 * @returns {JSX.Element} A modal component with customizable title, actions, and content.
 */

import { Modal, Frame } from "@shopify/polaris";

const ActionModalComponent = ({
  modalTitle,
  modalPrimaryButton,
  modalSecondaryButton,
  modalActive,
  handleModalClose,
  children,
  onPrimaryAction, // Accept the primary action function
}) => {
  // This function wraps the provided onPrimaryAction with handleModalClose to ensure the modal is closed after the action is performed
  const handlePrimaryAction = () => {
    if (onPrimaryAction) {
      onPrimaryAction();
    }
    handleModalClose();
  };

  return (
    <Frame>
      <Modal
        open={modalActive}
        onClose={handleModalClose}
        title={modalTitle}
        primaryAction={{
          content: modalPrimaryButton,
          onAction: handlePrimaryAction, // Use the wrapper function here
        }}
        secondaryActions={[
          {
            content: modalSecondaryButton || "Cancel",
            onAction: handleModalClose,
          },
        ]}
      >
        <Modal.Section>{children}</Modal.Section>
      </Modal>
    </Frame>
  );
};

export default ActionModalComponent;