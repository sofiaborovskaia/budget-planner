/** Identifies a period by its dates — passed to server actions to get-or-create the period row.
 *  Using ISO strings because Date objects are not serializable across server action boundaries.
 */
export interface PeriodKey {
  startDate: string;
  endDate: string;
  name: string;
}
