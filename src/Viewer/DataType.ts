export interface SimResults {
  is_damage_mode: boolean;
  active_char: string;
  char_names: string[];
  damage_by_char: { [key: string]: SummaryStats }[];
  damage_instances_by_char: { [key: string]: SummaryStats }[];
  damage_by_char_by_targets: { [key: number]: SummaryStats }[];
  char_active_time: SummaryStats[];
  abil_usage_count_by_char: { [key: string]: SummaryStats }[];
  particle_count: { [key: string]: SummaryStats };
  reactions_triggered: { [key: string]: SummaryStats };
  sim_duration: SummaryStats;
  ele_uptime: { [key: number]: SummaryStats }[];
  required_er: number[] | null;
  damage: SummaryStats;
  dps: SummaryStats;
  dps_by_target: { [key: number]: SummaryStats };
  damage_over_time: { [key: string]: SummaryStats };
  iter: number;
  text: string;
  debug: string;
  runtime: number;
  config_file: string;
  num_targets: number;
}

export interface SummaryStats {
  mean: number;
  min: number;
  max: number;
  sd?: number;
}
