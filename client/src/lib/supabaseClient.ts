import { createClient } from '@supabase/supabase-js';

// Paramètres de connexion Supabase (remplacés par tes valeurs)
const supabaseUrl = 'https://lqcqmcnrkmozafvhjimm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxY3FtY25ya21vemFmdmhqaW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTgyMzcsImV4cCI6MjA4MTI5NDIzN30.Pr6UDgGAAkN7B1-DzJmZ6dn_Is_xRUZJ6S-92c3hlAg';

export const supabase = createClient(supabaseUrl, supabaseKey);

