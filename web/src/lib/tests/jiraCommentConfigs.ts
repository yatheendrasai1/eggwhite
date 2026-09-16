import type { JiraCommentConfig } from "@/lib/tests/jiraComment";
import { FRAMING_THE_SITUATION } from "@/lib/tests/framingTheSituation";

export const JIRA_COMMENT_CONFIGS: Record<string, JiraCommentConfig> = {
  "framing-the-situation": FRAMING_THE_SITUATION,
};

export const isJiraCommentTest = (id: string): boolean => id in JIRA_COMMENT_CONFIGS;
