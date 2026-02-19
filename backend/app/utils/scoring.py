import pandas as pd
from sklearn.metrics import accuracy_score, mean_squared_error
import os

def calculate_score(submission_path: str, solution_path: str, metric: str) -> float:
    """
    Calculates the score based on the submission and solution files.
    """
    try:
        # Load CSVs
        submission_df = pd.read_csv(submission_path)
        solution_df = pd.read_csv(solution_path)

        # Standardize column names: lowercase and strip whitespace
        submission_df.columns = [c.strip().lower() for c in submission_df.columns]
        solution_df.columns = [c.strip().lower() for c in solution_df.columns]

        # --- ID Handling Logic ---
        id_col = 'id'
        
        # Check if 'id' column exists
        has_id_sol = id_col in solution_df.columns
        has_id_sub = id_col in submission_df.columns

        if not has_id_sol:
            # Fallback 1: Composite key 'frame' + 'player_id' (Specific to sports tracking)
            if 'frame' in solution_df.columns and 'player_id' in solution_df.columns:
                solution_df[id_col] = solution_df['frame'].astype(str) + '_' + solution_df['player_id'].astype(str)
                # Apply same logic to submission if needed
                if not has_id_sub and 'frame' in submission_df.columns and 'player_id' in submission_df.columns:
                    submission_df[id_col] = submission_df['frame'].astype(str) + '_' + submission_df['player_id'].astype(str)
            # Fallback 2: Use the first column as ID if it looks like an identifier (unique)
            elif solution_df.iloc[:, 0].is_unique:
                original_col_name = solution_df.columns[0]
                solution_df[id_col] = solution_df.iloc[:, 0]
                # Try to use same column name in submission
                if not has_id_sub and original_col_name in submission_df.columns:
                     submission_df[id_col] = submission_df[original_col_name]
                elif not has_id_sub:
                     # Just assume first column matches
                     submission_df[id_col] = submission_df.iloc[:, 0]
            # Fallback 3: Use row index (Risky but necessary if no ID provided)
            else:
                solution_df[id_col] = solution_df.index
                if not has_id_sub:
                    submission_df[id_col] = submission_df.index

        # Re-check ID presence after fallbacks
        if id_col not in solution_df.columns:
             raise ValueError(f"Solution file missing 'id' column. Found: {list(solution_df.columns)}")
        if id_col not in submission_df.columns:
             # If submission still doesn't have ID, try using its index if solution used index
             submission_df[id_col] = submission_df.index

        # Ensure unique IDs
        if solution_df[id_col].duplicated().any():
             # If duplicate IDs found (even after fallback 1), try fallback 3 (index)
             print("Warning: Duplicate IDs found in solution file. Falling back to row index.")
             solution_df[id_col] = solution_df.index
             submission_df[id_col] = submission_df.index

        # If submission has duplicates, we can't score properly.
        if submission_df[id_col].duplicated().any():
             # Try to drop duplicates? Or raise error? Standard is error.
             raise ValueError("Submission file contains duplicate IDs.")

        # Align DataFrames by ID
        # Set ID as index for easier alignment
        solution_df = solution_df.set_index(id_col).sort_index()
        submission_df = submission_df.set_index(id_col).sort_index()

        # Check for missing IDs in submission
        missing_ids = solution_df.index.difference(submission_df.index)
        if not missing_ids.empty:
             raise ValueError(f"Submission is missing predictions for {len(missing_ids)} IDs.")

        # Keep only relevant rows (intersection of IDs)
        submission_df = submission_df.loc[solution_df.index]

        # Identify target columns (all non-index columns that are NOT part of the original composite key if we made one)
        # We need to exclude 'frame', 'player_id' if they exist, as they are not targets.
        exclude_cols = ['frame', 'player_id', 'id', 'team', 'field_x', 'field_y'] # Exclude known non-targets
        # Actually, let's be smarter. In the solution file, columns that are NOT the ID are usually the targets.
        # But if we synthesized the ID, we might have left the original columns.
        
        # Heuristic: Target columns are those present in solution_df that are NOT 'id', 'frame', 'player_id'
        # UNLESS the competition explicitly defines targets (which we don't have here).
        # Let's assume target is the LAST column if we can't decide, OR all other numeric columns?
        
        # BETTER: Use the intersection of columns between solution and submission (excluding ID/Frame/Player)
        # Assuming the user submits ONLY ID + Targets.
        
        potential_targets = [c for c in solution_df.columns if c not in ['frame', 'player_id', 'team']]
        
        # If solution has many columns (e.g. metadata), we only want to score the ones that are also in submission.
        target_cols = [c for c in potential_targets if c in submission_df.columns]
        
        if not target_cols:
             # Fallback: Use all columns from submission (except ID)
             target_cols = [c for c in submission_df.columns if c not in ['frame', 'player_id']]
             
        # Check if we still have targets
        if not target_cols:
             raise ValueError("Could not identify target columns for scoring.")

        y_true = solution_df[target_cols]
        y_pred = submission_df[target_cols]
        
        # Check for NaN in predictions
        if y_pred.isnull().values.any():
            raise ValueError("Submission contains NaN/missing values in target columns.")
            
        # Ensure numeric types for scoring
        try:
            y_true = y_true.apply(pd.to_numeric)
            y_pred = y_pred.apply(pd.to_numeric)
        except:
            pass # Maybe classification with strings?

        if metric.upper() == "ACCURACY":
            # sklearn accuracy_score does NOT support continuous-multioutput.
            # If targets are floats, we might need a custom threshold or rounding.
            # BUT usually Accuracy is for classification.
            # If the user selected ACCURACY but provided regression data, we have a mismatch.
            
            # Check if targets are continuous (floats)
            is_continuous = False
            try:
                # Check if any value is a float with decimals
                if (y_true.dtypes == 'float').any() or (y_true.dtypes == 'float64').any():
                     # Check if they are actually integers disguised as floats (e.g. 1.0, 0.0)
                     if not (y_true % 1 == 0).all().all():
                          is_continuous = True
            except:
                pass

            if is_continuous:
                 # If continuous, Accuracy is undefined. Fallback to something else or round?
                 # Let's assume they want "exact match" after rounding?
                 # Or maybe this IS a regression task and they chose the wrong metric.
                 # Let's try rounding to nearest integer for classification accuracy.
                 y_true = y_true.round().astype(int)
                 y_pred = y_pred.round().astype(int)
            
            # Flatten arrays if multi-output (to handle multiclass-multioutput error)
            # accuracy_score on 2D arrays computes subset accuracy (all columns must match for a row to be correct)
            # If we want overall element-wise accuracy, we should flatten.
            # But usually Kaggle competitions with multiple columns treat each row as a sample.
            # "multiclass-multioutput is not supported" usually means sklearn can't handle the format.
            # Let's try flattening if it's 2D and see if that fixes it (element-wise accuracy).
            if len(y_true.shape) > 1 and y_true.shape[1] > 1:
                # Option A: Subset accuracy (strict row matching) - supported by accuracy_score if format is right
                # Option B: Element-wise accuracy (total correct cells / total cells)
                # Let's go with Option B as it's more forgiving and avoids the error for mixed types.
                y_true = y_true.values.flatten()
                y_pred = y_pred.values.flatten()

            return float(accuracy_score(y_true, y_pred))
        elif metric.upper() == "MSE":
            return float(mean_squared_error(y_true, y_pred))
        else:
            raise ValueError(f"Unsupported metric: {metric}")

    except Exception as e:
        # Re-raise ValueError directly to preserve the message
        if isinstance(e, ValueError):
            raise e
        raise ValueError(f"Error calculating score: {str(e)}")
