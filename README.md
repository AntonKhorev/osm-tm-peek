A Firefox browser extension for [OpenStreetMap](https://www.openstreetmap.org/) to enhance [changeset](https://wiki.openstreetmap.org/wiki/Changeset) pages with data from the [Tasking Manager](https://wiki.openstreetmap.org/wiki/Tasking_Manager) [API](https://tasks.hotosm.org/api-docs). Tasking manager projects corresponding to the changesets are detected using changeset hashtags.

Currently [HOT Tasking Manager](https://tasks.hotosm.org/) with `#hotosm-project-...` hashtags is supported.

## The problem

*[OpenStreetMap](https://www.openstreetmap.org/)* is a collaborative geographic database where users can make edits to the map available to everyone. The edits are grouped in *[changesets](https://wiki.openstreetmap.org/wiki/Changeset)* that may have [metadata](https://wiki.openstreetmap.org/wiki/Changeset#Tags_on_changesets), particularly [comments tags](https://wiki.openstreetmap.org/wiki/Key:comment), describing the contents or the goals of the edits and the sources of information used in making them. Such metadata might be helpful when reviewing edits made by other participants.

Sometimes editing is not done by individual users but rather by a group directed at some goal. This is know as [Organized Editing](https://wiki.openstreetmap.org/wiki/Organised_Editing). Such editing is often managed by specialized tools to assign various tasks to participants and to track the overall progress. Here we're concerned with one such tool, *[Tasking Manager](https://wiki.openstreetmap.org/wiki/Tasking_Manager)*. Tasking Manager lets users create *projects* divided into *tasks* to contribute data to a particular *area of interest* of the map.

Organized editing activities are usually aimed at making a lot of edits in a particular map area in a limited timeframe. This often involves inviting new users to start contributing to OpenStreetMap, possibly during some [event](https://wiki.openstreetmap.org/wiki/Mapathon). The result of such activities could be a large volume of edits done by newcomers without usable changeset metadata. Changeset comments are often repeated verbatim across the entire activity with human-readable part drowned in hashtags or omitted. This might be frustrating for OpenStreetMap users who don't participate in a particular organized mapping activity yet want to review its results.

One might get a better idea of the nature of the edits produced with the help of *Tasking Manager* by looking at the *project* page on the Tasking Manager website. One of the hashtags attached to every *changeset* submitted by the project participants typically includes the project id, which can be used to find the corresponding project webpage. Unfortunately this has to be done manually as there's no direct link from the changeset page on the OpenStreetMap website to the project webpage.

Some changesets, notably those made in a [web-based editor](https://wiki.openstreetmap.org/wiki/ID), may have a [host tag](https://wiki.openstreetmap.org/wiki/Key:host) with a link to the project map page. This page requires users to log in. Users who log in on the *Tasking Manager* website are then presented with a popup asking for their email. This may lead users to think that the project details are inaccessible to outsiders. However in most of the cases neither a login nor an email address is required to view this information, as it is accessible on another webpage and through the [Tasking Manager API](https://tasks.hotosm.org/api-docs).

## What this extension does

This browser extension attempts to facilitate the access to tasking manager project details by embedding them directly to changeset pages on the *OpenStreetMap* website. It does so by looking for *Tasking Manager* hashtags in changeset comments, extracting project ids and making requests to the API for project details. Links to project webpages and raw JSON data are added to changeset pages before making API requests. If possible, project areas of interest are added to the map view on the *OpenStreetMap* website.

Currently the project details are injected below the *Tags* table in the sidebar of the changeset webpage.
