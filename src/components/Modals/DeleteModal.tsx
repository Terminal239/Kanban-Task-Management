import Button from "../Reusable/Button";
import ModalWrapper from "../Utils/ModalWrapper";

interface Props {
  name: string;
  element: string;
  handleDelete: () => void;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const DeleteModal = ({ name, element, handleDelete, setShowModal }: Props) => {
  return (
    <ModalWrapper setShowModal={setShowModal} additionalClasses="flex flex-col items-center gap-6">
      <p className="w-[256px] text-center text-text md:w-[296px] md:text-xl">
        Are you sure you want to delete the {element} <span className="font-bold text-white">"{name}"</span>?
      </p>
      <div className="flex gap-4">
        <Button handleClick={() => setShowModal(false)} type="tertiary">
          Cancel
        </Button>
        <Button handleClick={handleDelete} type="desctructive">
          Delete
        </Button>
      </div>
    </ModalWrapper>
  );
};

export default DeleteModal;
