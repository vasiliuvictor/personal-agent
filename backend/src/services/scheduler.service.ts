import { supabaseAdmin } from '../config/supabase';
import { runAgent } from './agent-runner.service';
import { Agent } from '../types';

export interface SchedulerResult {
  ran: number;
  errors: string[];
}

export async function runDueAgents(): Promise<SchedulerResult> {
  const now = new Date().toISOString();

  const { data: dueAgents, error } = await supabaseAdmin
    .from('agents')
    .select('*')
    .lte('next_run_at', now);

  if (error) {
    throw new Error(`Failed to fetch due agents: ${error.message}`);
  }

  if (!dueAgents || dueAgents.length === 0) {
    console.log('[scheduler] No agents due to run.');
    return { ran: 0, errors: [] };
  }

  console.log(`[scheduler] Found ${dueAgents.length} agent(s) due to run.`);

  const errors: string[] = [];
  let ran = 0;

  // Run sequentially to respect API rate limits (Brave, Gemini)
  for (const agent of dueAgents as Agent[]) {
    try {
      await runAgent(agent);
      ran++;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[scheduler] Error running agent "${agent.name}" (${agent.id}): ${message}`);
      errors.push(`Agent "${agent.name}" (${agent.id}): ${message}`);
    }
  }

  console.log(`[scheduler] Done. Ran: ${ran}, Errors: ${errors.length}`);
  return { ran, errors };
}
