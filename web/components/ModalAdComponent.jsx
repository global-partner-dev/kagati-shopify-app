/**
 * ModalComponent
 * 
 * This component renders a modal using Shopify's Polaris library. The modal can display a title, primary and secondary actions, 
 * and any content passed as children. The component is highly customizable, allowing developers to define what happens when 
 * the primary or secondary actions are triggered.
 * 
 * @param {string} modalTitle - The title displayed at the top of the modal.
 * @param {string} modalPrimaryButton - The label for the primary action button.
 * @param {object} [modalSecondaryButton] - An optional object representing the secondary action button, containing:
 *   - {string} content: The label for the secondary action button.
 *   - {function} [onAction]: A function to execute when the secondary action button is clicked. Defaults to handleModalClose if not provided.
 * @param {boolean} modalActive - A boolean value indicating whether the modal is open or closed.
 * @param {function} handleModalClose - A function to close the modal, typically invoked when the modal is dismissed or a cancel action is triggered.
 * @param {function} [onPrimaryAction] - An optional function to execute when the primary action button is clicked. Defaults to handleModalClose if not provided.
 * @param {ReactNode} children - The content to be displayed within the modal's body.
 * 
 * @returns {JSX.Element} A modal component with customizable actions and content.
 */

import { Modal, Frame } from "@shopify/polaris";

const ModalComponent = ({
  modalTitle,
  modalPrimaryButton,
  modalSecondaryButton,
  modalActive,
  handleModalClose,
  onPrimaryAction, // Accept an onPrimaryAction prop
  children,
}) => {
  return (
    <Frame>
      <Modal
        open={modalActive}
        onClose={handleModalClose}
        title={modalTitle}
        primaryAction={{
          content: modalPrimaryButton,
          onAction: onPrimaryAction || handleModalClose, // Use onPrimaryAction if provided, otherwise fall back to handleModalClose
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: handleModalClose,
          },
          ...(modalSecondaryButton ? [{ // Conditionally add a secondary action if provided
            content: modalSecondaryButton.content, // Use content from the modalSecondaryButton prop
            onAction: modalSecondaryButton.onAction || handleModalClose, // Use onAction from modalSecondaryButton prop, or handleModalClose
          }] : []), // Add nothing if modalSecondaryButton is not provided
        ]}
      >
        <Modal.Section>{children}</Modal.Section>
      </Modal>
    </Frame>
  );
};

export default ModalComponent;