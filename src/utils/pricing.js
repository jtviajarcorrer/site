// Formatação de valores da expedição.
// Parcelado: Entrada + até N parcelas de R$ X (o total parcelado NÃO é exibido).
// À vista: valor em `price` (com desconto, via PIX).

export const brl = (n) =>
  `R$ ${Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

/** Dados de parcelamento prontos para exibir, ou null se a expedição não tiver parcelamento. */
export function getInstallments(exp) {
  const max = Number(exp?.installment_max);
  const value = Number(exp?.installment_value);
  if (!(max > 0) || !(value > 0)) return null;
  const entry = Number(exp?.installment_entry);
  return { entry: entry > 0 ? entry : null, max, value };
}

/** À vista (com desconto) ou null. */
export function getCashPrice(exp) {
  const p = Number(exp?.price);
  return p > 0 ? p : null;
}
