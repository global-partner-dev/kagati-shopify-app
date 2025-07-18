import { Modal, Frame } from "@shopify/polaris";

const ModalComponent = ({
  modalTitle,
  modalPrimaryButton,
  modalSecondaryButton,
  modalActive,
  handleModalClose,
  handleModelSave,
  modalSize,
  children,
  handleShowProducts, // Optional prop
}) => {
  const modelDone = () => {
    if (typeof handleShowProducts === "function") {
      handleShowProducts(true); // Call only if the function is provided
    }
    handleModelSave(); // Always save
  };

  return (
    <Frame>
      <Modal
        open={modalActive}
        onClose={handleModalClose}
        title={modalTitle}
        size={modalSize|| "large"}
        primaryAction={{
          content: modalPrimaryButton,
          onAction: modelDone,
        }}
        secondaryActions={
          modalSecondaryButton
            ? [
                {
                  content: "Cancel",
                  onAction: handleModalClose,
                },
                {
                  content: modalSecondaryButton,
                  onAction: handleModalClose,
                },
              ]
            : [
                {
                  content: "Cancel",
                  onAction: handleModalClose,
                },
              ]
        }
      >
        <Modal.Section>{children}</Modal.Section>
      </Modal>
    </Frame>
  );
};

export default ModalComponent;
