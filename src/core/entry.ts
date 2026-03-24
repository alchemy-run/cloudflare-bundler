export interface WorkerEntry {
  readonly file: string;
  readonly projectRoot: string;
  readonly format: "modules";
  readonly moduleRoot: string;
  readonly name?: string | undefined;
  readonly exports: ReadonlyArray<string>;
}
