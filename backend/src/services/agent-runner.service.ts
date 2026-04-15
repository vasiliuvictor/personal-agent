import { supabaseAdmin } from '../config/supabase';
import { searchBrave } from './brave.service';
import { generateInsight } from './gemini.service';
import { sendInsightEmail } from './email.service';
import { Agent, Source } from '../types';

function computeNextRun(frequency: Agent['search_frequency']): string {
  const now = new Date();
  const intervals: Record<string, number> = {
    hourly: 60 * 60 * 1000,
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
  };
  return new Date(now.getTime() + intervals[frequency]).toISOString();
}

export async function runAgent(agent: Agent): Promise<void> {
  const query = agent.keywords.join(' ');

  // 1. Search — freshness + random offset ensure varied results each run
  const searchResults = await searchBrave(query, agent.search_frequency);
  if (searchResults.length === 0) {
    console.log(`[agent-runner] No search results for agent "${agent.name}" (${agent.id})`);
    return;
  }

  // 2. Generate AI summary
  const summary = await generateInsight(query, searchResults);

  // 3. Build sources array (top 5)
  const sources: Source[] = searchResults.slice(0, 5).map(r => ({
    title: r.title,
    url: r.url,
    snippet: r.description,
  }));

  // 4. Store insight in DB
  const { error: insertError } = await supabaseAdmin
    .from('insights')
    .insert({
      agent_id: agent.id,
      user_id: agent.user_id,
      summary,
      sources,
      search_query: query,
      is_read: false,
    });

  if (insertError) {
    throw new Error(`Failed to insert insight for agent "${agent.name}": ${insertError.message}`);
  }

  // 5. Update agent's last_run_at and next_run_at
  const nextRun = computeNextRun(agent.search_frequency);
  const { error: updateError } = await supabaseAdmin
    .from('agents')
    .update({ last_run_at: new Date().toISOString(), next_run_at: nextRun })
    .eq('id', agent.id);

  if (updateError) {
    console.error(`[agent-runner] Failed to update agent timestamps for "${agent.name}": ${updateError.message}`);
  }

  // 6. Optionally send email notification
  if (agent.notification_email) {
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(agent.user_id);
    if (userError) {
      console.error(`[agent-runner] Could not fetch user email for agent "${agent.name}": ${userError.message}`);
    } else if (userData?.user?.email) {
      await sendInsightEmail(userData.user.email, agent.name, summary, sources);
    }
  }

  console.log(`[agent-runner] Agent "${agent.name}" ran successfully. Next run: ${nextRun}`);
}
