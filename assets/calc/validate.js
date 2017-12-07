import { evaluate } from './computations'
// validate the input.
export const validateInputForm = (inputForm) => {
  let transformedInputForm = inputForm

  // verify the bounds are correct.
  if (inputForm.dr <= inputForm.dl) {
    throw new Error('domain is not valid')
  }
  if (inputForm.rt <= inputForm.rb) {
    throw new Error('range is not valid')
  }

  // verify numeric inputs.
  let numberInputRegex = /^-?\d*\.{0,1}\d+$/
  if (!numberInputRegex.test(inputForm.dl) ||
      !numberInputRegex.test(inputForm.dr) ||
      !numberInputRegex.test(inputForm.rb) ||
      !numberInputRegex.test(inputForm.rt)) {
    throw new Error('non-numeric inputs somewhere.')
  }

  // verify the function is valid on the left and right domain.
  let testreturn = evaluate(inputForm.function, inputForm.dl)
  if (isNaN(testreturn)) {
    throw new Error('Function is not valid on left x bound.')
  }

  let testreturnright = evaluate(inputForm.function, inputForm.dr)
  if (isNaN(testreturnright)) {
    throw new Error('Function is not valid on right x bound.')
  }

  //   let inputRegex = /^-?\d*\.{0,1}\d+$/
  //   if (inputRegex.test(val)) {
  //     // which is used as the bound.
  //     switch (which) {
  //       case 'left' : {
  //         if (val >= state.domainRight) {
  //           state.isBoundsCorrect = false
  //           return
  //         }
  return transformedInputForm
}
