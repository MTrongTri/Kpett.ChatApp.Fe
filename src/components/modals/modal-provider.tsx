"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { closeModal } from "@/store/features/modalSlice";
import { ModalComponents } from "./modal-registry";

export function ModalProvider() {
  const { isOpen, type } = useSelector((state: RootState) => state.modal);
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(closeModal());
  };

  if (!type) return null;

  const ActiveModal = ModalComponents[type];

  if(!ActiveModal) return null;

  return <ActiveModal isOpen={isOpen} onClose={handleClose} />;
}
