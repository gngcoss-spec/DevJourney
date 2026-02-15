import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseGitHubUrl } from '@/lib/analysis/github-api';
import { analyzeRepo } from '@/lib/analysis/analysis-engine';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { repo_url, service_id } = body;

    if (!repo_url || !service_id) {
      return NextResponse.json(
        { error: 'repo_url and service_id are required' },
        { status: 400 }
      );
    }

    // Parse GitHub URL
    let parsed: { owner: string; repo: string };
    try {
      parsed = parseGitHubUrl(repo_url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid GitHub URL format' },
        { status: 400 }
      );
    }

    // Auth check via Supabase
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create DB record with status 'running'
    const { data: analysis, error: insertError } = await supabase
      .from('code_analyses')
      .insert({
        service_id,
        user_id: user.id,
        repo_url,
        repo_owner: parsed.owner,
        repo_name: parsed.repo,
        status: 'running',
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: `Failed to create analysis record: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Run analysis
    try {
      const result = await analyzeRepo(parsed.owner, parsed.repo);

      // Update DB with results
      const { data: updated, error: updateError } = await supabase
        .from('code_analyses')
        .update({
          status: 'completed',
          findings: result.findings,
          summary: result.summary,
          analyzed_at: new Date().toISOString(),
        })
        .eq('id', analysis.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      return NextResponse.json(updated);
    } catch (analysisError) {
      // Update DB with failure
      const errorMessage = analysisError instanceof Error
        ? analysisError.message
        : 'Unknown analysis error';

      await supabase
        .from('code_analyses')
        .update({
          status: 'failed',
          error_message: errorMessage,
        })
        .eq('id', analysis.id);

      return NextResponse.json(
        { error: errorMessage, analysis_id: analysis.id },
        { status: 500 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
