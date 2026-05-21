import { createClient } from '@supabase/supabase-js'

const url = 'https://vpmnvyxgzjfheljsuhgz.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbW52eXhnempmaGVsanN1aGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMTE0NTQsImV4cCI6MjA5NDg4NzQ1NH0.yfCJiHdLgiJMb0aviJmtC94BiIubPjhDYyLln6vBo5Q'

export const supabase = createClient(url, key)
