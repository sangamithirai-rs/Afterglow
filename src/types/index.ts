import type { Database } from './database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Experience = Database['public']['Tables']['experiences']['Row']
export type ExperienceInsert = Database['public']['Tables']['experiences']['Insert']
export type Photo = Database['public']['Tables']['photos']['Row']
export type Song = Database['public']['Tables']['songs']['Row']
export type TimelineEntry = Database['public']['Tables']['timeline_entries']['Row']
export type Person = Database['public']['Tables']['people']['Row']