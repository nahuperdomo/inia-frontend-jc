import { LoteFormData } from "@/lib/validations/lotes-validation";

export interface LotFormTabsProps {
  formData: LoteFormData;
  onInputChange: (field: keyof LoteFormData, value: any) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isLoading?: boolean;
  loteId?: number;
}