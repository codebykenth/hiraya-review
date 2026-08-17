<?php

namespace App\Policies;

use App\Models\LearnModule;
use App\Models\User;

class LearnModulePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, LearnModule $learnModule): bool
    {
        if ($learnModule->is_published) {
            return true;
        }

        return $user?->isAdmin() ?? false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, LearnModule $learnModule): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, LearnModule $learnModule): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can manage modules in bulk.
     */
    public function manageAny(User $user): bool
    {
        return $user->isAdmin();
    }
}
