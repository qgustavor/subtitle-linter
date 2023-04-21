import m from '../vendor/mithril.js'

const availableRules = [
  'languagetool',
  'literal-translations',
  'rare-words',
  'fixed-expressions',
  'misspelled-expressions',
  'extra-whitespace',
  'letter-case',
  'quotes',
  'undefined-style',
  'line-breaks',
  'escaped-braces',
  'invalid-tags',
  'honorific-mismatch',
  'number-mismatch',
  'missing-translations',
  'wrong-translations',
  'wrong-line-break',
  'glyph-whitelist',
  'font-whitelist',
  'short-dialogues',
  'missing-border',
  'fast-dialogues'
]

const defaultEnabledRules =  [
  'languagetool',
  'literal-translations',
  'rare-words',
  'fixed-expressions',
  'misspelled-expressions',
  'extra-whitespace',
  'letter-case',
  'quotes',
  'undefined-style',
  'line-breaks',
  'escaped-braces',
  'invalid-tags',
  'honorific-mismatch',
  'number-mismatch',
  'missing-translations',
  'wrong-translations',
  'wrong-line-break'
]

const defaultRuleSpecificSettings = {
  languagetool: {
    ignoredRules: [
      'À-HÁ_N_TEMPO',
      'ABREVIATIONS_PUNCTUATION',
      'ACCENTUATED_PARONYMS_ESTA',
      'ACHO_QUE',
      'ALTERNATIVE_CONJUNCTIONS_COMMA',
      'AO90_CARDINAL_POINTS_CASING',
      'AONDE_BR', // too many false positives
      'AONDE_ONDE',
      'AONDE_VERB_ESTAR',
      'ARCHAISMS',
      'ARTICLES_PRECEDING_LOCATIONS',
      'AS_PONTUAL_BR', // too many false positives
      'ATRAVES_DE_POR_VIA',
      'AUTO-FALANTE',
      'AUXILIARY_VERB_INFINITIVE', // too many false positives
      'A_NIVEL',
      'A_QUANDO',
      'A_TERRA_FIRME_BR',
      'A_XXX_DE_VOCÊS',
      'BARBARISMS',
      'CACOPHONY',
      'CERCA_DE_NR',
      'CHEGAMOS_EM_BR',
      'CHEMICAL_FORMULAS_TYPOGRAPHY',
      'CHILDISH_LANGUAGE',
      'CIENTÍFICO_*',
      'CLICHE_*',
      'COM_A_GENTE_CONNOSCO_CONOSCO_PT_BR',
      'CONJUNTIVO_OBRIGATORIO',
      'CRASE_CONFUSION', // too many false positives
      'CRASE_CONFUSION_2', // too many false positives
      'DAQUI_BR', // too many false positives
      'DASH_ENUMERATION_SPACE_RULE',
      'DASH_RULE',
      'DASH_SPACE_RULES',
      'DATE_WEEKDAY_WITHOUT_YEAR',
      'DECIMAL_COMMA',
      'DEPOIS_DE_APÓS',
      'DE_AGORA_ATUAL_ATUAIS',
      'DOUBLE_PUNCTUATION',
      'ELES_ELAS',
      'ENCRENCA_ENCRENCAS',
      'ENUMERATIONS_AND_AND',
      'ERRO_DE_CONCORDNCIA_DO_GÉNERO_MASCULINO_O',
      'ESPERA_QUE_INDICATIVO',
      'ESTAR-ESTÃO_A_PLURAL',
      'ESTAR_CLARO_DE_QUE',
      'ETC_USAGE',
      'EU_NÓS_REMOVAL',
      'E_NO_COMECO',
      'E_É_SÃO_FOI_FORAM_SENDO_SIDO',
      'FINAL_STOPS', // don't apply to subtitles
      'FORMAL_*',
      'FRAGMENT_TWO_ARTICLES',
      'GENERAL_GENDER_AGREEMENT_ERRORS', // too many false positives
      'GENERAL_NUMBER_FORMAT',
      'GENERAL_PRONOMIAL_COLOCATIONS',
      'GENERAL_VERB_AGREEMENT_ERRORS', // too many false positives
      'GRAMMATICAL_DOUBLE_NEGATIVES',
      'HIPHEN_SPACE_RULES',
      'HOMONYM_VIAGEM_2', // too many false positives
      'HYPOTHESIS_TYPOGRAPHY',
      'INFORMALITIES',
      'INIMIGO_ADVERSÁRIO_ALIADO_OPONENTE',
      'INTERJECTIONS_PUNTUATION',
      'INTERNET_ABBREVIATIONS',
      'INTERROGATIVES_PUNTUATION', // too many false positives
      'IR_CONTRACTION_NOUN',
      'MULTIPLICATION_SIGN',
      'NADA_DEMAIS',
      'NOS_VERBO',
      'NO_SPACE_CLOSING_QUOTE',
      'NO_VERB',
      'NUMBER_ABREVIATION',
      'OBLIQUOUS_PRONOUN_VERB',
      'ORDINAL_ABREVIATION',
      'O_FACTO_DA_ACÇÂO',
      'O_QUANTO_ANTES_BR',
      'PALAVRAS-CHAVES',
      'PARA-POR_TER_PARTICIPIO-PASSADO',
      'PARASITO_BR',
      'PARONYM_RADIA_271',
      'PEQUENOS_Detalhes',
      'PHRASAL_VERB_DE',
      'PHRASAL_VERB_TER_DE_QUE',
      'PORQUE_VERBOEUELE_AS_OS_POR_AO_VERBOINF_AS',
      'PORTUGUESE_WORD_REPEAT_BEGINNING_RULE',
      'POR_QUE_PORQUE', // too many false positives
      'PREFERIR_ANTES',
      'PROFANITY',
      'PT_BARBARISMS_REPLACE',
      'PT_BR_SIMPLE_REPLACE',
      'PT_CLICHE_REPLACE',
      'PT_COMPOUNDS_POST_REFORM',
      'PT_SIMPLE_REPLACE', // too many false positives
      'PT_WEASELWORD_REPLACE',
      'PT_WIKIPEDIA_COMMON_ERRORS',
      'PT_WORDINESS_REPLACE',
      'PUNCTUATION_PARAGRAPH_END', // don't apply to subtitles
      'QUER_SE_BR',
      'QUE_HÁ_QUE_NÃO_HÁ',
      'QUE_VEM_PROXIMA',
      'QUE_VERBO',
      'QUE_É-SÃO_NC-ADJ_COMO-POR',
      'QUE_É_PARTPASS_PARTPASS',
      'REDUNDANCY_*',
      'REDUNDANT_CONJUNCTIONS',
      'REGARDS_COMMA',
      'REMOVER_EU_NÓS',
      'REPEATED_WORDS',
      'REPEATED_WORDS_3X',
      'ROMAN_NUMBERS_CHECKER',
      'SEMICOLON_COLON_SPACING',
      'SENTENCE_FRAGMENT',
      'SENTENCE_WHITESPACE',
      'SENT_START_NUM', // too many false positives
      'SEQUER_WITHOUT_NEGATIVE',
      'SER_CAPAZ_DE_CONSEGUIR',
      'SER_NC_QUE_VERBO_VINFINITIVO',
      'SIMPLIFICAR_*',
      'SOMOS_EM_BR',
      'SPACE_AFTER_PUNCTUATION',
      'SPACE_BEFORE_PUNCTUATION', // implement in separate rule
      'TER_SIDO_PART_PASSADO_VERBO',
      'TIME_FORMAT',
      'TIRAR_FOTOGRAFIA_FOTOGRAFAR',
      'TODOS_FOLLOWED_BY_NOUN_PLURAL',
      'TOO_LONG_SENTENCE',
      'TORNAR_MAIS_FORTE',
      'UNIDADES_METRICAS',
      'UNITS_OF_MEASURE_SPACING',
      'UNLIKELY_OPENING_PUNCTUATION',
      'UNPAIRED_BRACKETS', // implement in separate rule
      'UPPERCASE_AFTER_COMMA',
      'UPPERCASE_SENTENCE_START',
      'VERBO_DE_QUE',
      'VERB_COMMA_CONJUNCTION',
      'VIR_A_VERBO_VERBO',
      'WHITESPACE_RULE', // already in separate rule
      'WORDINESS'
    ]
  }
}

export default function () {
  const addedFiles = new Set()
  const enabledRules = localStorage.lastRules
    ? JSON.parse(localStorage.lastRules)
    : defaultEnabledRules.slice()

  let ruleSpecificSettings = JSON.stringify(defaultRuleSpecificSettings, null, 2)
  let file = localStorage.lastFile || ''
  let language = localStorage.lastLanguage || ''
  let loadingState = 'idle'
  let loadingMessage = ''

  async function createTask (evt) {
    evt.preventDefault()
    loadingState = 'loading'
    file = file.replace(/^"|"$/g, '')

    if (addedFiles.has(file)) {
      loadingState = 'error'
      return
    }

    let parsedSettings = {}
    if (ruleSpecificSettings) {
      try {
        parsedSettings = JSON.parse(ruleSpecificSettings)
      } catch {
        loadingState = 'error'
        return
      }
    }

    if (parsedSettings && parsedSettings.languagetool) {
      parsedSettings.languagetool.language = language
    }

    const options = {
      rules: enabledRules.map(e => parsedSettings[e] ? [e, parsedSettings[e]] : e)
    }

    const body = { file, options }
    localStorage.lastFile = file
    localStorage.lastLanguage = language
    localStorage.lastRules = JSON.stringify(enabledRules)

    try {
      const newTask = await m.request({ url: '/api/tasks/', method: 'POST', body })
      loadingState = 'idle'
      addedFiles.add(file)
      loadingMessage = `${file} adicionado`
    } catch (error) {
      loadingState = 'error'
      loadingMessage = error?.response?.message || error
    }
  }

  return {
    view: () => m('.new-task-view', {onsubmit: createTask},
      m('h2', 'New linter task'),

      m('form.form-horizontal',
        m('.form-group',
          m('.col-3.col-sm-12', m('label.form-label', 'File path')),
          m('.col-9.col-sm-12', m('input.form-input[type="text"]', {
            disabled: loadingState === 'loading',
            oninput: e => {file = e.target.value},
            ondblclick: e => {
              const el = e.target
              el.selectionStart = el.value.lastIndexOf('/', el.selectionEnd - 1) + 1
              el.selectionEnd = el.value.indexOf('/', el.selectionStart + 1)
            },
            value: file
          })
        )),

        m('.form-group', {
          style: enabledRules.includes('languagetool') ? '' : 'display: none'
        },
          m('.col-3.col-sm-12', m('label.form-label', 'Language (for LanguageTool)')),
          m('.col-9.col-sm-12', m('input.form-input[type="text"]', {
            placeholder: 'language in xx-XX format (en-US, pt-BR) or xx format (ja, fr, de) or "auto" (default if blank)',
            disabled: loadingState === 'loading' || !enabledRules.includes('languagetool'),
            oninput: e => {language = e.target.value},
            value: language
          })
        )),

        m('.form-group',
          m('.col-3.col-sm-12', m('label.form-label', 'Enabled rules')),
          m('.col-9.col-sm-12.scrollable-group',
            availableRules.map(rule => m('label.form-checkbox', {
              key: 'rule_selector_' + rule
            }, m('input[type="checkbox"]', {
              disabled: loadingState === 'loading',
              checked: enabledRules.includes(rule),
              onchange: () => {
                const index = enabledRules.indexOf(rule)
                if (index === -1) {
                  enabledRules.push(rule)
                } else {
                  enabledRules.splice(index, 1)
                }
              }
            }), m('i.form-icon'), rule))
          )
        ),

        m('.form-group',
          m('.col-3.col-sm-12', m('label.form-label', 'Rule specific settings')),
          m('.col-9.col-sm-12', m('textarea.form-input', {
            disabled: loadingState === 'loading',
            oninput: e => {ruleSpecificSettings = e.target.value},
            value: ruleSpecificSettings,
            rows: 4
          }))
        ),

        m('button.btn.btn-primary' + (
          loadingState === 'loading' ? '.loading[disabled]'
            : loadingState === 'error' ? '.btn-error'
            : ''
        ), 'Create task'),
        m('span.mx-2', {}, loadingMessage)
      )
    )
  }
}
