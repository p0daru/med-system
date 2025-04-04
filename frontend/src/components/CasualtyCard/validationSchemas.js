// // src/components/CasualtyCard/validationSchemas.js
// import { z } from 'zod';
// import constants from '../../constants/constants.json'; // Adjust path if needed

// // --- Individual Schemas ---

// // Schema for Allergies (Refined)
// const knownAllergiesSchema = z.object(
//     Object.fromEntries(constants.commonAllergens.map(a => [a, z.boolean()]))
// );
// const allergiesSchema = z.object({
//     known: knownAllergiesSchema,
//     other: z.string().max(200, "Максимум 200 символів").optional(),
//     nka: z.boolean().optional(),
// }).refine(data => !(!data.nka && Object.values(data.known).every(v => !v) && !data.other?.trim()), {
//     // Require NKA, or at least one known allergy, or 'other' if NKA is false
//     message: "Вкажіть алергії, 'Інше', або відмітьте 'Немає відомих алергій'",
//     // You might want to refine the path later if needed
//     // path: ["nka"], // Or path: ["known"] or path: ["other"] depending on UI
// });


// // Schema for one Tourniquet Entry (Refined)
// const tourniquetLimbSchema = z.object({
//     time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Невірний формат часу (HH:MM)").optional().or(z.literal('')),
//     type: z.string().optional(),
//     typeOther: z.string().max(50, "Максимум 50 символів").optional(),
// }).superRefine((data, ctx) => {
//     // If time or type exists, type becomes required
//     if ((data.time || data.type) && !data.type) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "Оберіть тип турнікета",
//         path: ["type"],
//       });
//     }
//     // If type is 'Інше', typeOther is required
//     if (data.type === 'Інше' && !data.typeOther?.trim()) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "Вкажіть тип в полі 'Інше'",
//         path: ["typeOther"],
//       });
//     }
// });

// // Schema for all Tourniquets
// const tourniquetsSchema = z.object({
//     rightArm: tourniquetLimbSchema.optional(),
//     leftArm: tourniquetLimbSchema.optional(),
//     rightLeg: tourniquetLimbSchema.optional(),
//     leftLeg: tourniquetLimbSchema.optional(),
// });

// // Schema for one Vital Sign Row (as defined before)
// export const vitalSignRowSchema = z.object({
//     // RHF provides 'id' automatically for keys, you can keep your own if needed
//     internalId: z.string().optional(), // Optional internal ID
//     time: z.string().regex(/^$|^([01]\d|2[0-3]):([0-5]\d)$/, "Невірний формат часу (HH:MM)"), // HH:MM format or empty
//     pulse: z.string()
//       .refine(val => val === '' || /^\d+$/.test(val), { message: "Лише цифри" })
//       .refine(val => val === '' || (parseInt(val, 10) > 0 && parseInt(val, 10) <= 300), { message: "Пульс: 1-300" })
//       .optional().or(z.literal('')),
//     bp: z.string()
//       .regex(/^$|^\d{1,3}\/\d{1,3}$/, "Формат АТ: ЧЧЧ/ЧЧЧ")
//       .optional().or(z.literal('')),
//     rr: z.string()
//        .refine(val => val === '' || /^\d+$/.test(val), { message: "Лише цифри" })
//        .refine(val => val === '' || (parseInt(val, 10) > 0 && parseInt(val, 10) <= 90), { message: "ЧД: 1-90" })
//        .optional().or(z.literal('')),
//     spO2: z.string()
//        .refine(val => val === '' || /^\d+$/.test(val), { message: "Лише цифри" })
//        .refine(val => val === '' || (parseInt(val, 10) >= 0 && parseInt(val, 10) <= 100), { message: "SpO2: 0-100" })
//        .optional().or(z.literal('')),
//     avpu: z.string().optional(),
//     pain: z.string().optional(),
//   });

// // Schema for Fluids Given Row (Example - adjust as needed)
// const fluidGivenRowSchema = z.object({
//     internalId: z.string().optional(),
//     time: z.string().regex(/^$|^([01]\d|2[0-3]):([0-5]\d)$/, "Невірний формат часу (HH:MM)"),
//     name: z.string().min(1, "Оберіть назву рідини").optional().or(z.literal('')),
//     // nameOther: z.string().optional(), // Add if needed for 'Інше...'
//     amount: z.string()
//         .refine(val => val === '' || /^\d+$/.test(val), { message: "Лише цифри" })
//         .refine(val => val === '' || parseInt(val, 10) > 0, { message: "К-сть має бути > 0" })
//         .optional().or(z.literal('')),
//     route: z.string().min(1, "Оберіть шлях введення").optional().or(z.literal('')),
// }).superRefine((data, ctx) => {
//      // Require amount and route if name is present
//      if (data.name && (!data.amount || !data.route)) {
//          if (!data.amount) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Вкажіть кількість", path: ["amount"] });
//          if (!data.route) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Оберіть шлях", path: ["route"] });
//      }
//      // Handle 'Інше...' if needed
//     //  if (data.name === 'Інше...' && !data.nameOther?.trim()) { /* ... */ }
// });

// // Schema for Medications Given Row (Example)
// const medicationGivenRowSchema = z.object({
//     internalId: z.string().optional(),
//     time: z.string().regex(/^$|^([01]\d|2[0-3]):([0-5]\d)$/, "Невірний формат часу (HH:MM)"),
//     name: z.string().min(1, "Оберіть назву ліків").optional().or(z.literal('')),
//     nameOther: z.string().max(100, "Максимум 100 символів").optional(),
//     dosageValue: z.string()
//         .refine(val => val === '' || /^\d+(\.\d+)?$/.test(val), { message: "Лише числа" }) // Allows decimals
//         .refine(val => val === '' || parseFloat(val) > 0, { message: "Доза має бути > 0" })
//         .optional().or(z.literal('')),
//     dosageUnit: z.string().optional(),
//     route: z.string().min(1, "Оберіть шлях введення").optional().or(z.literal('')),
// }).superRefine((data, ctx) => {
//     if (data.name === 'Інше...' && !data.nameOther?.trim()) {
//         ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Вкажіть назву в полі 'Інше'", path: ["nameOther"] });
//     }
//     const hasValue = data.dosageValue && data.dosageValue !== '';
//     const hasUnit = !!data.dosageUnit;
//     if (hasValue && !hasUnit) {
//         ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Оберіть од.", path: ["dosageUnit"] });
//     }
//     if (!hasValue && hasUnit) {
//         ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Вкажіть дозу", path: ["dosageValue"] });
//     }
//     // Require value, unit, route if name is present
//     if (data.name && data.name !== 'Інше...' && (!hasValue || !hasUnit || !data.route)) {
//         if (!hasValue) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Вкажіть дозу", path: ["dosageValue"] });
//         if (!hasUnit) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Оберіть од.", path: ["dosageUnit"] });
//         if (!data.route) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Оберіть шлях", path: ["route"] });
//     }
//     // Add more logic if needed
// });

// // Schema for Hypothermia/Other Aid
// const aidHypothermiaOtherSchema = z.object({
//     combatPillPack: z.boolean().optional(),
//     eyeShieldSide: z.string().optional(), // Changed from boolean flags
//     splinting: z.boolean().optional(),
//     hypothermiaPrevention: z.boolean().optional(),
//     hypothermiaPreventionType: z.string().optional(),
//     hypothermiaPreventionTypeOther: z.string().max(100, "Максимум 100 символів").optional(),
// }).superRefine((data, ctx) => {
//     if (data.hypothermiaPrevention && !data.hypothermiaPreventionType) {
//         ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Оберіть тип попередження", path: ["hypothermiaPreventionType"] });
//     }
//     if (data.hypothermiaPreventionType === 'Інше...' && !data.hypothermiaPreventionTypeOther?.trim()) {
//         ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Вкажіть тип в полі 'Інше'", path: ["hypothermiaPreventionTypeOther"] });
//     }
// });


// // --- Main Casualty Card Schema ---
// export const casualtyCardSchema = z.object({
//     // Section 1: Patient Data
//     individualNumber: z.string().optional(), // Assigned by backend or generated
//     patientFullName: z.string().max(100, "Максимум 100 символів").optional(),
//     last4SSN: z.string().regex(/^$|^\d{4}$/, "Введіть 4 цифри").optional(),
//     gender: z.string().optional(),
//     injuryDate: z.string().min(1, "Оберіть дату поранення"),
//     injuryTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Оберіть час поранення (HH:MM)"),
//     branchOfService: z.string().optional(),
//     branchOfServiceOther: z.string().max(100, "Максимум 100 символів").optional(),
//     unit: z.string().max(100, "Максимум 100 символів").optional(),
//     allergies: allergiesSchema.optional(),
//     evacuationPriority: z.string().optional(), // Keep optional or add required rule

//     // Section 2: Injury Info
//     mechanismOfInjury: z.array(z.string()).optional(), // Assuming array of strings
//     mechanismOfInjuryOther: z.string().max(150, "Максимум 150 символів").optional(),
//     injuryDescription: z.string().max(500, "Максимум 500 символів").optional(),

//     // Section 3: Tourniquets
//     tourniquets: tourniquetsSchema.optional(),

//     // Section 4: Vital Signs
//     vitalSigns: z.array(vitalSignRowSchema).optional(),

//     // Section 5: Provided Aid (Circulation, Airway, Breathing, Fluids)
//     aidCirculation: z.object({ // Make specific fields required if necessary
//         tourniquetJunctional: z.boolean().optional(),
//         tourniquetTruncal: z.boolean().optional(),
//         dressingHemostatic: z.boolean().optional(),
//         dressingPressure: z.boolean().optional(),
//         dressingOther: z.boolean().optional()
//     }).optional(),
//     aidAirway: z.object({
//         intact: z.boolean().optional(),
//         npa: z.boolean().optional(),
//         cric: z.boolean().optional(),
//         etTube: z.boolean().optional(),
//         supraglottic: z.boolean().optional()
//     }).optional(),
//     aidBreathing: z.object({
//         o2: z.boolean().optional(),
//         needleDecompression: z.boolean().optional(),
//         chestTube: z.boolean().optional(),
//         occlusiveDressing: z.boolean().optional()
//     }).optional(),
//     fluidsGiven: z.array(fluidGivenRowSchema).optional(),

//     // Section 6: Medications & Other Aid
//     medicationsGiven: z.array(medicationGivenRowSchema).optional(),
//     aidHypothermiaOther: aidHypothermiaOtherSchema.optional(),

//     // Section 7: Notes
//     notes: z.string().max(1000, "Максимум 1000 символів").optional(),

//     // Section 8: Provider Data
//     providerFullName: z.string().max(100, "Максимум 100 символів").optional(),
//     providerLast4SSN: z.string().regex(/^$|^\d{4}$/, "Введіть 4 цифри").optional(),

// }).superRefine((data, ctx) => {
//     // Example: Require Full Name OR SSN
//     if (!data.patientFullName?.trim() && !data.last4SSN?.trim()) {
//       ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Вкажіть ПІБ або останні 4 цифри НСС", path: ["patientFullName"] });
//       // Also add to last4SSN path if needed for UI
//       // ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Вкажіть ПІБ або останні 4 цифри НСС", path: ["last4SSN"] });
//     }
//     // Example: Cross-field validation for Branch of Service 'Other'
//     if (data.branchOfService === 'Інше' && !data.branchOfServiceOther?.trim()) {
//         ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Вкажіть рід військ в полі 'Інше'", path: ["branchOfServiceOther"] });
//     }
// });