const linter = require('..')
const argv = require('yargs').argv
const glob = require('glob')
const util = require('util')

const globPromise = util.promisify(glob)

async function initCli () {
  let files = argv._
  if (files.length === 0) files = ['**/*.ass']

  files = await Promise.all(files.map(e => {
    if (!glob.hasMagic(e)) return e
    return globPromise(e)
  }))
  files = files.reduce((a, b) => a.concat(b), [])

  const options = {
    // to be defined
    rules: [
      // 'extraneous-sections',
      // 'extra-whitespace',
      // 'comment-tags',
      'commented-line',
      'literal-translations',
      'rare-words',
      'fixed-expressions',
      'misspelled-expressions',
      /* ['languagetool', {
        ignoredRules: [
          'ABREVIATIONS_PUNCTUATION',
          'ACHO_QUE',
          'ALTERNATIVE_CONJUNCTIONS_COMMA',
          'AO90_MONTHS_CASING', // apenas no caso da HIDIVE
          'AO90_WEEKDAYS_CASING', // apenas no caso da HIDIVE
          'AONDE_BR', // too many false positives
          'ARCHAISMS',
          'ARTICLES_PRECEDING_LOCATIONS',
          'AS_PONTUAL_BR', // too many false positives
          'AUXILIARY_VERB_INFINITIVE', // too many false positives
          'A_XXX_DE_VOCÊS',
          'BARBARISMS',
          'CACOPHONY',
          'CHILDISH_LANGUAGE',
          'CLICHE_*',
          'CONJUNTIVO_OBRIGATORIO',
          'CRASE_CONFUSION', // too many false positives
          'DAQUI_BR', // too many false positives
          'HOMONYM_VIAGEM_2', // too many false positives
          'DASH_ENUMERATION_SPACE_RULE',
          'DASH_RULE',
          'DASH_SPACE_RULES',
          'DECIMAL_COMMA',
          'DOUBLE_PUNCTUATION',
          'ENUMERATIONS_AND_AND',
          'ESTAR_CLARO_DE_QUE',
          'ETC_USAGE', // apenas no caso da HIDIVE
          'EU_NÓS_REMOVAL',
          'E_NO_COMECO',
          'FINAL_STOPS', // don't apply to subtitles
          'FORMAL_COM_NÓS',
          'FORMAL_SPEECH',
          'FRAGMENT_TWO_ARTICLES',
          'GENERAL_GENDER_AGREEMENT_ERRORS', // too many false positives
          'GENERAL_VERB_AGREEMENT_ERRORS', // too many false positives
          'GRAMMATICAL_DOUBLE_NEGATIVES',
          'INFORMALITIES',
          'INTERJECTIONS_PUNTUATION',
          'INTERROGATIVES_PUNTUATION', // too many false positives
          'IR_CONTRACTION_NOUN',
          'NOS_VERBO',
          'NO_VERB',
          'NUMBER_ABREVIATION',
          'ORDINAL_ABREVIATION',
          'PORTUGUESE_WORD_REPEAT_BEGINNING_RULE',
          'POR_QUE_PORQUE', // too many false positives
          'PROFANITY',
          'PT_BARBARISMS_REPLACE',
          'PT_BR_SIMPLE_REPLACE',
          'PT_CLICHE_REPLACE',
          'PT_SIMPLE_REPLACE', // too many false positives
          'PT_WEASELWORD_REPLACE',
          'PT_WIKIPEDIA_COMMON_ERRORS',
          'PT_WORDINESS_REPLACE',
          'PUNCTUATION_PARAGRAPH_END', // don't apply to subtitles
          'QUER_SE_BR',
          'REDUNDANCY_*',
          'REDUNDANT_CONJUNCTIONS',
          'REGARDS_COMMA',
          'REPEATED_WORDS',
          'REPEATED_WORDS_3X',
          'ROMAN_NUMBERS_CHECKER',
          'SENTENCE_WHITESPACE', // apenas no caso da HIDIVE
          'SENT_START_NUM', // too many false positives
          'SPACE_AFTER_PUNCTUATION', // apenas no caso da HIDIVE
          'UNITS_OF_MEASURE_SPACING',
          'UNPAIRED_BRACKETS', // implement in separate rule
          'SPACE_BEFORE_PUNCTUATION', // implement in separate rule
          'PARONYM_RADIA_271',
          'UPPERCASE_AFTER_COMMA',
          'UPPERCASE_SENTENCE_START',
          'VERBO_DE_QUE',
          'VERB_COMMA_CONJUNCTION',
          'WHITESPACE_RULE', // apenas no caso da HIDIVE
          'WORDINESS',
          'À-HÁ_N_TEMPO',
        ]
      }] */
    ]
  }

  const lintingProcess = linter(files, options)
  lintingProcess.on('result', error => console.log(error))
  await lintingProcess.finished
}

initCli().catch(error => {
  console.error(error)
  process.exit(1)
})
