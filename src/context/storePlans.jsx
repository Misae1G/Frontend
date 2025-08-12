import { create } from "zustand";

const storePlans = create(set => ({
  modal: false,
  toggleModal: () => set(state => ({ modal: !state.modal })),
  selectedPlan: null,
  setSelectedPlan: (plan) => set({ selectedPlan: plan }),
}));

export default storePlans;
