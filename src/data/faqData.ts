import { FAQ } from "@/types/faq";
import { TranslationKey } from "@/translations/types";

export const getFAQs = (t: (key: TranslationKey) => string): FAQ[] => [
  {
    question: t("faq_what_is"),
    answer: t("faq_what_is_answer")
  },
  {
    question: t("faq_receive_page"),
    answer: t("faq_receive_page_answer")
  },
  {
    question: t("faq_valid_forever"),
    answer: t("faq_valid_forever_answer")
  },
  {
    question: t("faq_can_edit"),
    answer: t("faq_can_edit_answer")
  }
];