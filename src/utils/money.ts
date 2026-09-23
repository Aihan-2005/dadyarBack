export const RIALS_PER_TOMAN =
  10


function assertSafeNonNegativeInteger(
  value:
    number,

  fieldName:
    string,
): void {
  if (
    !Number.isSafeInteger(
      value,
    ) ||
    value <
      0
  ) {
    throw new Error(
      `${fieldName} must be a non-negative safe integer`,
    )
  }
}


 
export function calculateDiscountedTomanAmount(
  priceToman:
    number,

  discountPercent:
    number,
): number {
  assertSafeNonNegativeInteger(
    priceToman,
    'priceToman',
  )


  if (
    !Number.isInteger(
      discountPercent,
    ) ||
    discountPercent <
      0 ||
    discountPercent >
      100
  ) {
    throw new Error(
      'discountPercent must be an integer between 0 and 100',
    )
  }


  const amountToman =
    Math.round(
      (
        priceToman *
        (
          100 -
          discountPercent
        )
      ) /
        100,
    )


  assertSafeNonNegativeInteger(
    amountToman,
    'amountToman',
  )


  return amountToman
}

 
export function tomanToRial(
  amountToman:
    number,
): number {
  assertSafeNonNegativeInteger(
    amountToman,
    'amountToman',
  )


  const amountRial =
    amountToman *
    RIALS_PER_TOMAN


  if (
    !Number.isSafeInteger(
      amountRial,
    )
  ) {
    throw new Error(
      'Converted rial amount exceeds safe integer range',
    )
  }


  return amountRial
}