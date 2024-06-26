<script lang="ts">
  import { FilteredMsaAccountsDerivedStore } from '$lib/stores/derived/MsaAccountsDerivedStore';
  import { goto } from '$app/navigation';
  import {
    type CurrentSelectedMsaAccount,
    CurrentSelectedMsaAccountStore,
  } from '$lib/stores/CurrentSelectedMsaAccountStore';
  import MsaAndAccountSelector from '$lib/components/MsaAndAccountSelector.svelte';
  import FooterButton from '$lib/components/FooterButton.svelte';
  import { base } from '$app/paths';
  import { CachedLastUsedMsaAndAddressStore, type MsaAndAddress } from '$lib/stores/CachedLastUsedMsaAndAddressStore';
  import { onMount } from 'svelte';
  import { getDelegatedSchemaPermissions } from '@amplica-labs/siwf-utils';
  import { RequestResponseStore } from '$lib/stores/RequestResponseStore';

  let selectedMsaWithAccount: CurrentSelectedMsaAccount;
  let initialSelection: MsaAndAddress;

  $: nextEnabled = !!selectedMsaWithAccount;

  $: {
    $CurrentSelectedMsaAccountStore = selectedMsaWithAccount;
  }

  async function handleNext() {
    if (nextEnabled) {
      $CachedLastUsedMsaAndAddressStore = {
        msaId: selectedMsaWithAccount.msaId,
        address: selectedMsaWithAccount.account.address,
      };

      const { hasDelegation, missingSchemaPermissions, expectedSchemaPermissions } =
        await getDelegatedSchemaPermissions(
          selectedMsaWithAccount.msaId,
          $RequestResponseStore.request.providerId,
          $RequestResponseStore.request.requiredSchemas.map((s) => s.id || 0)
        );

      RequestResponseStore.updateDelegation(!hasDelegation, missingSchemaPermissions, expectedSchemaPermissions);

      if (hasDelegation && !missingSchemaPermissions?.length) {
        goto(`${base}/signin/confirm`);
      } else {
        goto(`${base}/signup/update-delegations`);
      }
    } else {
      console.error('Button not enabled');
    }
  }

  onMount(() => {
    if ($CachedLastUsedMsaAndAddressStore) {
      initialSelection = $CachedLastUsedMsaAndAddressStore;
    }
  });
</script>

<div class="flex h-full items-center justify-center pb-9">
  <span class=" text-[16px] font-bold">Choose a handle to sign in with</span>
</div>
<div class="pb-[64px]">
  <MsaAndAccountSelector
    msaEntries={Object.values($FilteredMsaAccountsDerivedStore)}
    bind:selectedMsaWithAccount
    {initialSelection}
  />
</div>
<FooterButton on:click={handleNext}>Next > Sign In</FooterButton>
<div class="flex items-center justify-center pb-4 pt-8">
  <a href={`${base}/signup/handle`} class="text-center text-sm font-semibold">Create an account</a>
</div>
