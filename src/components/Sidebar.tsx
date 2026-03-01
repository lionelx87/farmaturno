import type { Pharmacy } from '../types/pharmacy';

interface Props {
  pharmacies: Pharmacy[];
  selectedDate: Date;
}

export default function Sidebar({ pharmacies, selectedDate }: Props) {
  // TODO: implement sidebar (date selector, theme toggle, pharmacy list, detail card)
  return <aside />;
}
