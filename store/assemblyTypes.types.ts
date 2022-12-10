import { ChapterProps } from './superTypes.types'

export type AssemblyTranscibeResponse = {
    id: string
    language_model: 'assemblyai_default'
    acoustic_model: 'assemblyai_default'
    language_code: 'en_us'
    status: 'queued' | 'processing' | 'completed' | 'error' | null
    audio_url: string
    text: null
    words: null
    utterances: null
    confidence: null
    audio_duration: null
    punctuate: true
    format_text: true
    dual_channel: null
    webhook_url: null
    webhook_status_code: null
    webhook_auth: false
    webhook_auth_header_name: null
    speed_boost: false
    auto_highlights_result: null
    auto_highlights: boolean
    audio_start_from: null
    audio_end_at: null
    word_boost: []
    boost_param: null
    filter_profanity: false
    redact_pii: false
    redact_pii_audio: false
    redact_pii_audio_quality: null
    redact_pii_policies: null
    redact_pii_sub: null
    speaker_labels: false
    content_safety: false
    iab_categories: false
    content_safety_labels: {}
    iab_categories_result: {}
    language_detection: false
    custom_spelling: null
    cluster_id: null
    throttled: null
    summarization: false
    summary_type: null
    disfluencies: false
    sentiment_analysis: false
    sentiment_analysis_results: null
    auto_chapters: boolean
    chapters: null | ChapterProps[]
    entity_detection: boolean
    entities: null
  }